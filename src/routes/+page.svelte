<script>
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import {Input} from "$lib/components/ui/input";
    import {Label} from "$lib/components/ui/label";

    import ResultsTable from "$lib/components/ResultsTable.svelte";
    import Play from "$lib/components/Play.svelte";

</script>

<div class="container mx-auto p-4">
    <div class="flex gap-4 flex-col md:flex-row">
        <div class="md:w-3/5 space-y-4">
            <div class="w-full">
                <Play />
            </div>

            <div class="w-full">
                <ResultsTable />
            </div>
        </div>

        <div class="md:w-2/5">
            <Card.Root class="h-4/5">
                <Card.Header>
                    <Card.Title>Chat</Card.Title>
                    <Card.Description>
                        Chat with other players
                    </Card.Description>
                </Card.Header>
                <Card.Content class="flex-grow overflow-y-auto h-[calc(100%-8rem)]">
                    <!-- Chat messages will go here -->
                    <div class="space-y-4">
                        <!-- Placeholder for chat messages -->
                    </div>
                </Card.Content>
                <Card.Footer class="border-t pt-2">
                    <div class="flex gap-2 w-full">
                        <Input placeholder="Type a message..." />
                        <Button>Send</Button>
                    </div>
                </Card.Footer>
            </Card.Root>
        </div>
    </div>
</div>