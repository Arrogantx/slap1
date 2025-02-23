<script>
    import { supabase } from '$lib/supabase';
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import { Button } from "$lib/components/ui/button";
    import { connected, signerAddress } from "$lib/store";
    import { onMount } from 'svelte';
    import * as format from "$lib/format";

    let isAdmin = $state(false);
    let requests = $state([]);
    let loading = $state(true);

    async function checkAdminStatus() {
        if (!$signerAddress) return;
        
        const { data } = await supabase
            .from('admins')
            .select()
            .eq('wallet_address', $signerAddress)
            .single();
            
        isAdmin = !!data;
    }

    async function loadRequests() {
        const { data } = await supabase
            .from('whitelist_requests')
            .select('*')
            .order('created_at', { ascending: false });
            
        requests = data || [];
        loading = false;
    }

    async function updateStatus(id, newStatus) {
        await supabase
            .from('whitelist_requests')
            .update({ status: newStatus })
            .eq('id', id);
            
        await loadRequests();
    }

    $effect(() => {
        if ($connected && $signerAddress) {
            checkAdminStatus();
            if (isAdmin) {
                loadRequests();
            }
        }
    });
</script>

<div class="container mx-auto py-8">
    {#if !$connected}
        <Card.Root class="max-w-md mx-auto">
            <Card.Content class="text-center py-8">
                Please connect your wallet to access the admin panel.
            </Card.Content>
        </Card.Root>
    {:else if !isAdmin}
        <Card.Root class="max-w-md mx-auto">
            <Card.Content class="text-center py-8">
                You don't have admin access.
            </Card.Content>
        </Card.Root>
    {:else}
        <Card.Root>
            <Card.Header>
                <Card.Title>Whitelist Requests</Card.Title>
                <Card.Description>Manage whitelist requests</Card.Description>
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
                                <Table.Cell colspan="4" class="text-center">No requests found</Table.Cell>
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
                                        {#if request.status === 'pending'}
                                            <div class="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    on:click={() => updateStatus(request.id, 'approved')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    on:click={() => updateStatus(request.id, 'rejected')}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        {/if}
                                        }
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
    {/if}
    }
</div>