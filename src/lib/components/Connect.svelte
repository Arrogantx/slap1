<script>
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { modal, wagmiAdapter } from "$lib/appkit";
    import {
        accountState,
        networkState,
        appKitState,
        themeState,
        events,
        walletInfo,
        signerAddress,
        connected
    } from "$lib/store";

    import { getAccount, getBalance } from '@wagmi/core';
    import { Button } from "$lib/components/ui/button";

    let props = $props();

    const connect = async () => {
        
    }

    const disconnect = async () => {};

    onMount(async () => {
        if (!modal) return;

        modal.subscribeAccount((state) => {
            $accountState = state;
            $connected = $accountState.isConnected;
            $signerAddress = $accountState.address;
        });

        modal.subscribeNetwork((state) => {
            $networkState = state;
            
        });

        modal.subscribeState((state) => {
            $appKitState = state;
        });

        modal.subscribeEvents((state) => {
            $events = state;
        });

        modal.subscribeWalletInfo((state) => {
            $walletInfo = state;
        });

    });
</script>
<appkit-button props></appkit-button>
