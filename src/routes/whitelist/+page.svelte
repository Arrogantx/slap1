<script>
    import { supabase } from '$lib/supabase';
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { connected, signerAddress } from "$lib/store";
    import { onMount } from 'svelte';

    let status = $state('');
    let loading = $state(false);

    async function checkWhitelistStatus() {
        if (!$signerAddress) return;
        
        loading = true;
        try {
            const { data, error } = await supabase
                .from('whitelist_requests')
                .select('status')
                .eq('wallet_address', $signerAddress.toLowerCase());
                
            if (data && data.length > 0) {
                status = data[0].status;
            } else {
                status = '';
            }
        } catch (error) {
            console.error('Failed to check whitelist status:', error);
        } finally {
            loading = false;
        }
    }

    async function requestWhitelist() {
        if (!$signerAddress) return;
        
        loading = true;
        try {
            // First ensure user exists
            const { error: userError } = await supabase
                .from('users')
                .upsert([
                    { wallet_address: $signerAddress.toLowerCase() }
                ]);

            if (userError) throw userError;

            // Then create whitelist request
            const { error } = await supabase
                .from('whitelist_requests')
                .insert([
                    { 
                        wallet_address: $signerAddress.toLowerCase(),
                        status: 'pending'
                    }
                ]);
                
            if (!error) {
                status = 'pending';
            } else {
                throw error;
            }
        } catch (error) {
            console.error('Failed to request whitelist:', error);
            alert('Failed to submit whitelist request. Please try again.');
        } finally {
            loading = false;
        }
    }

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
                    </div>
                {:else if status === 'approved'}
                    <div class="text-center">
                        <p class="text-green-500">Congratulations! You are whitelisted for the presale.</p>
                    </div>
                {:else if status === 'rejected'}
                    <div class="text-center">
                        <p class="text-red-500">Your whitelist request was not approved.</p>
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