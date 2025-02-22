<script>
    //icons
    import BoxesIcon from "lucide-svelte/icons/boxes";
    import MenuIcon from "lucide-svelte/icons/menu";

    //components
    import Connect from "./Connect.svelte";

    //shadcn components
    import * as Sheet from "$lib/components/ui/sheet";
    import { Button } from "$lib/components/ui/button";

    import xIcon from "$lib/assets/x-icon.png";
    import tgIcon from "$lib/assets/tg-icon.png";
    
    import * as config from "$lib/config";
</script>

<header class="bg-background w-full sticky top-0 flex h-16 items-center border-b px-4 md:px-6">

    <nav class="flex items-center text-lg font-medium md:text-sm">
        <a href="##" class="flex items-center gap-2 font-semibold md:text-base">
            AvaxSlap
        </a>
    </nav>
    <!--
    <div class="flex flex-1 justify-center space-x-2">
        <a href="##" class="text-foreground hover:text-foreground transition-colors">
            <img src={xIcon} class="w-7 h-7" alt="X" />
        </a>
        <a href="##" class="text-foreground hover:text-foreground transition-colors">
            <img src={tgIcon} class="w-7 h-7" alt="TG" />
        </a>
    </div>
    -->
    <div class="ml-auto">
        <Connect />
    </div>
</header>
