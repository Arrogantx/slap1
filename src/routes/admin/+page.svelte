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

    async function loadRequests() {
        try {
            loading = true;
            const { data, error } = await supabase
                .from('whitelist_requests')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            requests = data || [];
        } catch (error) {
            console.error('Failed to load requests:', error);
        } finally {
            loading = false;
        }
    }

    async function verifyUpdate(id, expectedStatus, maxAttempts = 3) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Wait a short time before checking
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { data, error } = await supabase
                .from('whitelist_requests')
                .select('status')
                .eq('id', id)
                .single();
                
            if (!error && data?.status === expectedStatus) {
                return true;
            }
        }
        return false;
    }

    async function updateStatus(id, newStatus) {
        if (updating) return;
        
        try {
            updating = true;
            
            // Check if request exists and is pending
            const { data: checkData, error: checkError } = await supabase
                .from('whitelist_requests')
                .select('status')
                .eq('id', id)
                .single();
                
            if (checkError) throw checkError;
            if (!checkData || checkData.status !== 'pending') {
                throw new Error('Request no longer pending');
            }
            
            // Perform the update
            const { error: updateError } = await supabase
                .from('whitelist_requests')
                .update({ 
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);
                
            if (updateError) throw updateError;
            
            // Verify the update with retries
            const verified = await verifyUpdate(id, newStatus);
            if (!verified) {
                throw new Error('Status update could not be verified');
            }
            
            // Remove the request from the local list
            requests = requests.filter(request => request.id !== id);
            
        } catch (error) {
            console.error('Failed to update status:', error);
            alert(`Failed to update request status: ${error.message}`);
        } finally {
            updating = false;
        }
    }

    $effect(() => {
        if ($connected && $signerAddress && $isAdmin) {
            loadRequests();
        }
    });

    // Set up periodic refresh
    onMount(() => {
        const interval = setInterval(() => {
            if ($connected && $signerAddress && $isAdmin) {
                loadRequests();
            }
        }, 15000); // Refresh every 15 seconds

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
                        <Button on:click={() => goto('/admin/whitelist')}>
                            View All Requests
                        </Button>
                    </div>
                </Card.Header>
                <Card.Content>
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
                                }
                            {/if}
                            }
                        </Table.Body>
                    </Table.Root>
                </Card.Content>
            </Card.Root>
        </div>
    {/if}
    }
</div>