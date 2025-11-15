<script>
    import { tick } from 'svelte';
    import proBadge from '$lib/assets/ProBadge.png';

    // --- PROPS ---
    let { 
        allColumnsA = [], 
        allColumnsB = [], 
        fileA = "File A", 
        fileB = "File B", 
        isProUser = false,
        overlayLink = "",
        onConfirm, 
        onCancel 
    } = $props();

    // --- STATE ---
    let selected = $state(new Set());
    let showUpgradeModal = $state(false); // Controls our new "soft gate" modal
    
    // THIS IS THE FIX for the "all selected" bug.
    // This effect runs when the props change, resetting the selection.
    $effect(() => {
        selected = new Set([...allColumnsA, ...allColumnsB]);
    });

    // --- DERIVED STATE ---
    let allSelected = $derived(selected.size === (allColumnsA.length + allColumnsB.length));
    let noneSelected = $derived(selected.size === 0);

    // --- FUNCTIONS ---
    function selectAll() {
        selected = new Set([...allColumnsA, ...allColumnsB]);
    }

    /**
     * Handles the "Select None" button.
     * If Free user, shows upgrade. If Pro, it works.
     */
    function handleSelectNone() {
        if (isProUser) {
            selected = new Set();
        } else {
            showUpgradeModal = true;
        }
    }

    /**
     * Handles a click on any checkbox.
     * If Free user, shows upgrade. If Pro, it works.
     */
    function handleCheckboxClick(e, column) {
        if (isProUser) {
            // Pro user: normal checkbox logic
            if (selected.has(column)) {
                selected.delete(column);
            } else {
                selected.add(column);
            }
            // This forces Svelte to see the change and update the derived state
            selected = new Set(selected);

        } else {
            // Free user:
            e.preventDefault(); // Prevent unchecking
            showUpgradeModal = true; // Show the modal
        }
    }

    /**
     * This is the final "Pro" download button.
     */
    function handleSubmit() {
        const selectedArray = Array.from(selected);
        onConfirm(selectedArray);
    }

    /**
     * This handles the "Upgrade" button click *inside* the soft-gate modal.
     */
    function handleUpgradeClick() {
        if (typeof LemonSqueezy !== 'undefined') {
            LemonSqueezy.Url.Open(overlayLink);
        } else {
            window.location.href = overlayLink;
        }
    }
</script>

<div class="selector-container">
    <h3>
        Select Columns to Export
        
    </h3>
    <p>Select the columns you want to include in your download.</p>

    <div class="quick-actions">
        <button 
            class:button-primary={!allSelected}
            class:button-secondary={allSelected}
            onclick={selectAll} 
            disabled={allSelected}
        >
            Select All
        </button>
        <button 
            class:button-primary={!noneSelected}
            class:button-secondary={noneSelected}
            onclick={handleSelectNone} 
            disabled={noneSelected}
        >
            Select None
        </button>
        
        {#if !isProUser}
            <button class="button-primary upgrade-button" onclick={handleUpgradeClick}>
                Upgrade to Pro
            </button>
        {:else}
            <img src={proBadge} alt="Pro User Badge" class="pro-badge-image" />
        {/if}
    </div>

    <div class="column-grid">
        <div class="column-list">
            <h4 title={fileA}>{fileA}</h4>
            {#each allColumnsA as column}
                <label>
                    <input 
                        type="checkbox" 
                        checked={selected.has(column)}
                        onchange={(e) => handleCheckboxClick(e, column)}
                    />
                    {column}
                </label>
            {/each}
        </div>

        <div class="column-list">
            <h4 title={fileB}>{fileB}</h4>
            {#each allColumnsB as column}
                <label>
                    <input 
                        type="checkbox" 
                        checked={selected.has(column)}
                        onchange={(e) => handleCheckboxClick(e, column)}
                    />
                    {column}
                </label>
            {/each}
        </div>
    </div>

    <div class="final-actions">
        <button class="button-secondary" onclick={onCancel}>Cancel</button>
        <button class="button-primary" onclick={handleSubmit}>Confirm Download</button>
    </div>
</div>

{#if showUpgradeModal}
    <div 
        class="soft-gate-backdrop" 
        onclick={() => showUpgradeModal = false}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (showUpgradeModal = false)}
        role="button" 
        tabindex="0"
    >
        <div 
            class="soft-gate-modal" 
            onclick={(event) => event.stopPropagation()}
            onkeydown={(event) => event.stopPropagation()}
            role="dialog" 
            aria-modal="true" 
            tabindex="-1"
        >
            <h3>Column Selection is a Pro Feature</h3>
            <p>
                To select specific columns for your download, please upgrade to <strong>Pro</strong>.
            </p>
            
            <div class="soft-gate-actions">
                <button class="button-secondary" onclick={() => showUpgradeModal = false}>
                    Cancel
                </button>
                <button class="button-primary" onclick={handleUpgradeClick}>
                    Upgrade to Pro ($19/year)
                </button>
            </div>
        </div>
    </div>
{/if}


<style>
    /* --- Main Container --- */
    .selector-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 600px; /* Set a specific width for desktop */
        max-width: 100%; /* Ensure it can shrink */
    }
    
    h3, p {
        margin: 0;
        text-align: center;
    }
    h3 {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
    }
    .pro-badge-image {
        display: inline-block;
        height: 28px;
        vertical-align: middle;
    }

    /* --- Quick Actions (Desktop) --- */
    .quick-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    /* This is the magic line for desktop: 
    it targets the Pro button OR the Pro badge 
    and pushes it to the far right. */
    .quick-actions > .upgrade-button,
    .quick-actions > .pro-badge-image {
        margin-left: auto;
    }

    /* --- Quick Actions (Mobile) --- */
      
    
    /* --- Column Lists --- */
    .column-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    .column-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #eee;
        padding: 0.75rem;
        border-radius: 6px;
    }
    .column-list h4 {
        margin: 0;
        padding-bottom: 2rem; /* Space below */
        padding-top: 0.25rem; /* Space above */
        border-bottom: 1px solid #ccc;
        font-size: 0.9rem;
        line-height: 1.4; /* Give text vertical breathing room */

        /* Truncate long filenames */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .column-list label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
    }

    /* --- Final Actions (Cancel/Confirm) --- */
    .final-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    /* --- Base Button Styles --- */
    .button-primary, .button-secondary {
        font-size: 0.9rem;
        font-weight: 600;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease, opacity 0.2s ease;
    }
    .button-primary {
        background-color: #3498db;
        color: white;
    }
    .button-primary:hover {
        background-color: #2980b9;
    }
    .button-primary:disabled,
    .button-secondary:disabled {
        background-color: #ecf0f1;
        color: #34495e;
        border: 1px solid #bdc3c7;
        opacity: 0.6;
        cursor: not-allowed;
    }
    .button-primary:disabled:hover,
    .button-secondary:disabled:hover {
        background-color: #ecf0f1;
    }
    .button-secondary {
        background-color: #ecf0f1;
        color: #34495e;
        border: 1px solid #bdc3c7;
    }
    .button-secondary:hover {
        background-color: #e2e6e8;
    }
    
    
    /* --- NEW SOFT GATE MODAL --- */
    .soft-gate-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 102; 
    }
    .soft-gate-modal {
        background: #fff;
        border-radius: 8px;
        padding: 2rem;
        width: 90%;
        max-width: 450px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        z-index: 103;
    }
    .soft-gate-modal h3 {
        font-size: 1.25rem;
    }
    .soft-gate-modal p {
        font-size: 0.95rem;
        line-height: 1.5;
    }
    .soft-gate-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    
    @media (max-width: 650px) {
        /* This stacks the "File A" and "File B" lists */
        .column-grid {
            grid-template-columns: 1fr;
        }

        /* This stacks the bottom "Cancel" and "Confirm" buttons */
        .final-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
        }

        .quick-actions {
            flex-direction: column; /* Stack all items */
            align-items: stretch;  /* Make all items full-width */
            gap: 0.5rem;
        }

        /* We reset the desktop margin */
        .quick-actions > .upgrade-button,
        .quick-actions > .pro-badge-image {
            margin-left: 0;
        }
    }

</style>