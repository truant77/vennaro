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
    // We now store "filename_columnname" to ensure uniqueness
    let selected = $state(new Set());
    let showUpgradeModal = $state(false); 
    
    // THIS IS THE FIX for the "all selected" bug.
    // We map both arrays to their unique prefixed versions.
    $effect(() => {
        selected = new Set([
            ...allColumnsA.map(col => `${fileA}_${col}`), 
            ...allColumnsB.map(col => `${fileB}_${col}`)
        ]);
    });

    // --- DERIVED STATE ---
    let allSelected = $derived(selected.size === (allColumnsA.length + allColumnsB.length));
    let noneSelected = $derived(selected.size === 0);

    // --- FUNCTIONS ---
    function selectAll() {
        selected = new Set([
            ...allColumnsA.map(col => `${fileA}_${col}`), 
            ...allColumnsB.map(col => `${fileB}_${col}`)
        ]);
    }

    function handleSelectNone() {
        if (isProUser) {
            selected = new Set();
        } else {
            showUpgradeModal = true;
        }
    }

    /**
     * UNIQUE KEY HANDLER
     * Uses the prefixed key so "ID" in File A is different from "ID" in File B.
     */
    function handleCheckboxClick(e, compositeKey) {
        if (isProUser) {
            if (selected.has(compositeKey)) {
                selected.delete(compositeKey);
            } else {
                selected.add(compositeKey);
            }
            selected = new Set(selected);
        } else {
            e.preventDefault(); 
            showUpgradeModal = true; 
        }
    }

    function handleSubmit() {
        // Returns the list of prefixed keys which match our resultsHeaders
        onConfirm(Array.from(selected));
    }

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
        {#if isProUser}
            <img src={proBadge} alt="Pro User Badge" class="pro-badge-image" />
        {/if}
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
        {/if}
    </div>

    <div class="column-grid">
        <div class="column-list">
            <h4 title={fileA}>{fileA}</h4>
            {#each allColumnsA as column}
                {@const compositeKey = `${fileA}_${column}`}
                <label>
                    <input 
                        type="checkbox" 
                        checked={selected.has(compositeKey)}
                        onchange={(e) => handleCheckboxClick(e, compositeKey)}
                    />
                    {column}
                </label>
            {/each}
        </div>

        <div class="column-list">
            <h4 title={fileB}>{fileB}</h4>
            {#each allColumnsB as column}
                {@const compositeKey = `${fileB}_${column}`}
                <label>
                    <input 
                        type="checkbox" 
                        checked={selected.has(compositeKey)}
                        onchange={(e) => handleCheckboxClick(e, compositeKey)}
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
            <p>To select specific columns for your download, please upgrade to <strong>Pro</strong>.</p>
            
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
    /* (Keep your existing styles exactly as they were) */
    .selector-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 600px;
        max-width: 100%;
    }
    
    h3, p { margin: 0; text-align: center; }
    h3 { display: flex; justify-content: center; align-items: center; gap: 0.5rem; }
    
    .pro-badge-image {
        display: inline-block;
        height: 28px;
        vertical-align: middle;
    }

    .quick-actions { display: flex; align-items: center; gap: 0.75rem; }

    .quick-actions > .upgrade-button,
    .quick-actions :global(.pro-badge-image) {
        margin-left: auto;
    }

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
        padding-bottom: 1rem;
        padding-top: 0.25rem;
        border-bottom: 1px solid #ccc;
        font-size: 0.9rem;
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .column-list label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        cursor: pointer;
    }

    .final-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    .button-primary, .button-secondary {
        font-size: 0.9rem;
        font-weight: 600;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
    }

    .button-primary { background-color: #3498db; color: white; }
    .button-primary:hover { background-color: #2980b9; }

    .button-primary:disabled, .button-secondary:disabled {
        background-color: #ecf0f1;
        color: #34495e;
        border: 1px solid #bdc3c7;
        opacity: 0.6;
        cursor: not-allowed;
    }

    .button-secondary {
        background-color: #ecf0f1;
        color: #34495e;
        border: 1px solid #bdc3c7;
    }

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

    .soft-gate-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    @media (max-width: 650px) {
        .column-grid { grid-template-columns: 1fr; }
        .final-actions { flex-direction: column; align-items: stretch; }
        .quick-actions { flex-direction: column; align-items: stretch; }
        .quick-actions > .upgrade-button,
        .quick-actions :global(.pro-badge-image) {margin-left: auto; }
    }
</style>