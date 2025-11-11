<script>
    // These are the props we'll pass into the component
    let { columnsA = [], columnsB = [], fileA = "File A", fileB = "File B", onConfirm, onCancel } = $props();

    // We'll store the *selected* columns in a Set for easy lookup
    let selected = $state(new Set([...columnsA, ...columnsB]));

    function selectAll() {
        selected = new Set([...columnsA, ...columnsB]);
    }

    function selectNone() {
        selected = new Set();
    }

    function handleSubmit() {
        // Convert the Set back to an array
        const selectedArray = Array.from(selected);
        onConfirm(selectedArray);
    }
</script>

<div class="selector-container">
    <h3>Select Columns to Export</h3>
    <p>Check the columns you want to include in your download.</p>

    <div class="quick-actions">
        <button class="link-button" onclick={selectAll}>Select All</button>
        <button class="link-button" onclick={selectNone}>Select None</button>
    </div>

    <div class="column-grid">
        <div class="column-list">
            <h4 title={fileA}>{fileA}</h4>
            {#each columnsA as column}
                <label>
                    <input 
                        type="checkbox" 
                        checked={selected.has(column)}
                        onchange={() => {
                            if (selected.has(column)) {
                                selected.delete(column);
                            } else {
                                selected.add(column);
                            }
                        }}
                    />
                    {column}
                </label>
            {/each}
        </div>
    
        <div class="column-list">
            <h4 title={fileB}>{fileB}</h4>
            {#each columnsB as column}
                <label>
                    <input 
                        type="checkbox" 
                        checked={selected.has(column)}
                        onchange={() => {
                            if (selected.has(column)) {
                                selected.delete(column);
                            } else {
                                selected.add(column);
                            }
                        }}
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

<style>
    .selector-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 600px;
    }

    h3, p {
        margin: 0;
    }

    .quick-actions {
        display: flex;
        gap: 1rem;
    }

    .link-button {
        background: none;
        border: none;
        color: #3498db;
        text-decoration: underline;
        cursor: pointer;
        padding: 0;
    }

    /* This is the new grid container */
    .column-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    /* This styles each individual list */
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

    .column-list label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
    }

    .column-list h4 {
        margin: 0; /* Reset margin */
        padding: 1rem 0.25rem; /* Add vertical padding */
        border-bottom: 1px solid #ccc;
        font-size: 0.9rem;
        line-height: 1; /* Ensure text has vertical space */

        /* Truncate long filenames */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .final-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    /* Base button styles */
    .button-primary, .button-secondary {
        font-size: 0.9rem;
        font-weight: 600;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .button-primary {
        background-color: #3498db;
        color: white;
    }
    .button-primary:hover {
        background-color: #2980b9;
    }

    .button-secondary {
        background-color: #ecf0f1;
        color: #34495e;
        border: 1px solid #bdc3c7;
    }
    .button-secondary:hover {
        background-color: #e2e6e8;
    }
</style>