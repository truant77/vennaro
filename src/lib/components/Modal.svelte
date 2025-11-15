<script>
    import { tick } from 'svelte';

    let { open = false, children } = $props();

    // We'll use this function to handle closing
    function handleClose() {
        open = false;
    }
</script>

{#if open}
    <div 
        class="modal-backdrop" 
        onclick={handleClose} 
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClose()}
        role="button" 
        tabindex="0"
    >
        <div 
            class="modal" 
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
            role="dialog" 
            aria-modal="true" 
            tabindex="-1"
        >
            {@render children()}
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;

        /* This is the fix: We are now in the normal z-index flow.
          We'll set our backdrop to 99, so Lemon Squeezy (at 2147483647)
          will always appear on top of it.
        */
        z-index: 99;
    }

    .modal {
        background: #fff;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        min-width: 400px;
        max-width: 90vw;
        max-height: 85vh; 
        overflow-y: auto;
        z-index: 100;
    }

    @media (max-width: 450px) {
        .modal {
            /* This is the fix. It removes the minimum width 
            and lets the modal shrink to fit the screen.
            */
            min-width: 90vw;
            padding: 1rem;
        }
    }
</style>