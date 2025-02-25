<script>
    import { supabase } from '$lib/supabase';
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { connected, signerAddress } from "$lib/store";
    import { onMount } from 'svelte';

    let status = $state('');
    let loading = $state(false);
    let lastChecked = $state(null);

    async function checkWhitelistStatus() {
        if (!$signerAddress) return;
        
        loading = true;
        try {
            const lowerAddress = $signerAddress.toLowerCase();
            console.log('Checking whitelist status for:', lowerAddress);
            
            const { data, error } = await supabase
                .from('whitelist_requests')
                .select('status, updated_at')
                .eq('wallet_address', lowerAddress)
                .order('updated_at', { ascending: false })
                .limit(1);
                
            if (error) {
                console.error('Whitelist status check error:', error);
                throw error;
            }
            
            if (data && data.length > 0) {
                status = data[0].status;
                lastChecked = new Date(data[0].updated_at);
            } else {
                status = '';
                lastChecked = null;
            }
            console.log('Whitelist status:', status, 'Last updated:', lastChecked);
        } catch (error) {
            console.error('Failed to check whitelist status:', error);
            status = '';
            lastChecked = null;
        } finally {
            loading = false;
        }
    }

    async function requestWhitelist() {
        if (!$signerAddress) return;
        
        loading = true;
        try {
            const lowerAddress = $signerAddress.toLowerCase();
            console.log('Submitting whitelist request for:', lowerAddress);
            
            // Create whitelist request
            const { error } = await supabase
                .from('whitelist_requests')
                .insert([{ 
                    wallet_address: lowerAddress,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]);
                
            if (error) {
                console.error('Whitelist request error:', error);
                throw error;
            }
            
            status = 'pending';
            lastChecked = new Date();
            console.log('Whitelist request submitted successfully');
        } catch (error) {
            console.error('Failed to request whitelist:', error);
            alert('Failed to submit whitelist request. Please try again.');
        } finally {
            loading = false;
        }
    }

    // Set up periodic status check
    let statusCheckInterval;

    onMount(() => {
        // Check status immediately if connected
        if ($connected && $signerAddress) {
            checkWhitelistStatus();
        }

        // Set up periodic check every 30 seconds
        statusCheckInterval = setInterval(() => {
            if ($connected && $signerAddress) {
                checkWhitelistStatus();
            }
        }, 30000);

        return () => {
            if (statusCheckInterval) {
                clearInterval(statusCheckInterval);
            }
        };
    });

    $effect(() => {
        if ($connected && $signerAddress) {
            checkWhitelistStatus();
        }
    });
</script>

<div class="container mx-auto py-8">
    <Card.Root class="max-w-md mx-auto neon-glow">
        <Card.Header>
            <Card.Title class="text-2xl font-bold text-center neon-text">Presale Whitelist</Card.Title>
            <Card.Description class="text-center">
                Request to join the presale whitelist
            </Card.Description>
        </Card.Header>
        <Card.Content>
            {#if $connected}
                {#if status === ''}
                    <div class="text-center">
                        <p class="mb-4">You haven't requested to join the whitelist yet.</p>
                        <Button 
                            class="hover-lift"
                            disabled={loading} 
                            on:click={requestWhitelist}
                        >
                            {loading ? 'Submitting...' : 'Request Whitelist'}
                        </Button>
                    </div>
                {:else if status === 'pending'}
                    <div class="text-center">
                        <p class="text-yellow-500">Your whitelist request is pending approval.</p>
                        {#if lastChecked}
                            <p class="text-sm text-muted-foreground mt-2">
                                Submitted: {lastChecked.toLocaleDateString()} {lastChecked.toLocaleTimeString()}
                            </p>
                        {/if}
                        }
                    </div>
                {:else if status === 'approved'}
                    <div class="text-center">
                        <p class="text-green-500">Congratulations! You are whitelisted for the presale.</p>
                        {#if lastChecked}
                            <p class="text-sm text-muted-foreground mt-2">
                                Approved: {lastChecked.toLocaleDateString()} {lastChecked.toLocaleTimeString()}
                            </p>
                        {/if}
                        }
                    </div>
                {:else if status === 'denied'}
                    <div class="text-center">
                        <p class="text-red-500">Your whitelist request was not approved.</p>
                        {#if lastChecked}
                            <p class="text-sm text-muted-foreground mt-2">
                                Updated: {lastChecked.toLocaleDateString()} {lastChecked.toLocaleTimeString()}
                            </p>
                        {/if}
                        }
                    </div>
                {/if}
                }
            {:else}
                <div class="text-center">
                    <p>Please connect your wallet to request whitelist access.</p>
                </div>
            {/if}
            }
        </Card.Content>
    </Card.Root>
</div>