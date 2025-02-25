<script>
    import { supabase } from '$lib/supabase';
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import { Button } from "$lib/components/ui/button";
    import { connected, signerAddress, isAdmin } from "$lib/store";
    import { onMount } from 'svelte';
    import * as format from "$lib/format";
    import { goto } from '$app/navigation';

    let requests = $state([]);
    let loading = $state(true);
    let updating = $state(false);
    let error = $state(null);

    async function loadRequests() {
        if (!$connected || !$signerAddress || !$isAdmin) {
            requests = [];
            return;
        }

        try {
            loading = true;
            error = null;
            const { data, error: fetchError } = await supabase
                .from('whitelist_requests')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
                
            if (fetchError) throw fetchError;
            requests = data || [];
        } catch (err) {
            console.error('Failed to load requests:', err);
            error = 'Failed to load whitelist requests. Please try again.';
            requests = [];
        } finally {
            loading = false;
        }
    }

    async function updateStatus(id, newStatus) {
        if (updating || !id || !newStatus) return;
        
        try {
            updating = true;
            error = null;

            // First verify the request still exists and is pending
            const { data: currentRequest, error: checkError } = await supabase
                .from('whitelist_requests')
                .select('status')
                .eq('id', id)
                .single();

            if (checkError) throw checkError;
            if (!currentRequest) throw new Error('Request not found');
            if (currentRequest.status !== 'pending') throw new Error('Request is no longer pending');

            // Perform the update with optimistic concurrency control
            const { error: updateError } = await supabase
                .from('whitelist_requests')
                .update({ 
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('status', 'pending'); // Only update if still pending

            if (updateError) throw updateError;

            // Verify the update was successful
            const { data: verifyRequest, error: verifyError } = await supabase
                .from('whitelist_requests')
                .select('status')
                .eq('id', id)
                .single();

            if (verifyError) throw verifyError;
            if (!verifyRequest || verifyRequest.status !== newStatus) {
                throw new Error('Failed to verify status update');
            }

            // Update local state only after successful database update
            requests = requests.filter(request => request.id !== id);

        } catch (err) {
            console.error('Failed to update status:', err);
            error = `Failed to update request status: ${err.message}`;
            // Reload requests to ensure consistent state
            await loadRequests();
        } finally {
            updating = false;
        }
    }

    // Watch for connection and admin status changes
    $effect(() => {
        if ($connected && $signerAddress && $isAdmin) {
            loadRequests();
        } else {
            requests = [];
            error = null;
        }
    });

    // Set up periodic refresh
    onMount(() => {
        const interval = setInterval(() => {
            if ($connected && $signerAddress && $isAdmin) {
                loadRequests();
            }
        }, 15000);

        return () => clearInterval(interval);
    });
</script>

<div class="container mx-auto py-8">
    {#if !$connected}
        <Card.Root class="max-w-md mx-auto">
            <Card.Content class="text-center py-8">
                Please connect your wallet to access the admin panel.
            </Card.Content>
        </Card.Root>
    {:else if !$isAdmin}
        <Card.Root class="max-w-md mx-auto">
            <Card.Content class="text-center py-8">
                You don't have admin access.
            </Card.Content>
        </Card.Root>
    {:else}
        <div class="space-y-8">
            <Card.Root>
                <Card.Header>
                    <div class="flex justify-between items-center">
                        <div>
                            <Card.Title>Pending Whitelist Requests</Card.Title>
                            <Card.Description>Manage pending whitelist requests</Card.Description>
                        </div>
                        <div class="flex gap-4">
                            <Button on:click={() => goto('/admin/blacklist')}>
                                Manage Blacklist
                            </Button>
                            <Button on:click={() => goto('/admin/whitelist')}>
                                View All Requests
                            </Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Content>
                    {#if error}
                        <div class="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
                            {error}
                        </div>
                    {/if}
                    
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Wallet</Table.Head>
                                <Table.Head>Status</Table.Head>
                                <Table.Head>Date</Table.Head>
                                <Table.Head>Actions</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#if loading}
                                <Table.Row>
                                    <Table.Cell colspan="4" class="text-center">Loading...</Table.Cell>
                                </Table.Row>
                            {:else if requests.length === 0}
                                <Table.Row>
                                    <Table.Cell colspan="4" class="text-center">No pending requests found</Table.Cell>
                                </Table.Row>
                            {:else}
                                {#each requests as request}
                                    <Table.Row>
                                        <Table.Cell>{format.address(request.wallet_address)}</Table.Cell>
                                        <Table.Cell>{request.status}</Table.Cell>
                                        <Table.Cell>
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div class="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    disabled={updating}
                                                    on:click={() => updateStatus(request.id, 'approved')}
                                                >
                                                    {updating ? 'Updating...' : 'Approve'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    disabled={updating}
                                                    on:click={() => updateStatus(request.id, 'denied')}
                                                >
                                                    {updating ? 'Updating...' : 'Deny'}
                                                </Button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                {/each}
                                
                            {/if}
                            
                        </Table.Body>
                    </Table.Root>
                </Card.Content>
            </Card.Root>
        </div>
    {/if}
    
</div>