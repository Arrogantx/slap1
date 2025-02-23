<script>
    import BoxesIcon from "lucide-svelte/icons/boxes";
    import MenuIcon from "lucide-svelte/icons/menu";
    import Connect from "./Connect.svelte";
    import * as Sheet from "$lib/components/ui/sheet";
    import { Button } from "$lib/components/ui/button";
    import * as config from "$lib/config";
</script>

<header class="bg-background w-full sticky top-0 flex h-16 items-center border-b px-4 md:px-6 z-50">
    <nav class="flex items-center text-lg font-medium md:text-sm">
        <a href="/" class="flex items-center gap-2 font-semibold md:text-base neon-text">
            AvaxSlap
        </a>
    </nav>
    <div class="ml-auto flex items-center space-x-4">
        <a href="/whitelist" class="hover-lift">Whitelist</a>
        <a href="/admin" class="hover-lift">Admin</a>
        <a href="/leaderboard" class="hover-lift">Leaderboard</a>
        <Connect />
    </div>
</header>