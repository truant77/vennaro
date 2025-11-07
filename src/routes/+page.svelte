<script>
    // ---------------------------------
    // STEP 1: SCRIPT (JavaScript)
    // ---------------------------------
    import Papa from 'papaparse';

    // --- Svelte State Variables ---
    // In Svelte, we just declare variables. When they change,
    // the UI automatically updates. This replaces document.getElementById.
    let dataA = null;
    let headersA = [];
    let previewA = ''; // For the file preview
    let selectedKeyA = '';

    let dataB = null;
    let headersB = [];
    let previewB = ''; // For the file preview
    let selectedKeyB = '';

    // --- Result State Variables ---
    let matches = [];
    let mismatchesA = [];
    let mismatchesB = [];
    let activeTab = 'matches'; // Controls which result tab is showing
    let resultsHeaders = []; // To store the headers for the results table

    // This will track if a comparison has been run
    let hasResults = false;

    // --- Reactive Variables ---
    // This 'isReady' variable will automatically re-calculate
    // whenever dataA or dataB changes. We use it to enable/disable the button.
    $: isReady = dataA && dataB;

    // --- Paywall State ---
    let showUpgradeModal = false;
    const FREE_TIER_LIMIT = 5; // Set to 5 for easy testing. We'll change this to 1000 later.

    /**
     * Handles file parsing for either File A or File B.
     * This one function replaces both of our old 'addEventListener' calls.
     */
    async function handleFile(event, fileType) {
        const file = event.target.files[0];
        if (!file) return;

        // 1. Generate the text preview
        // We read the first 1024 bytes as text to show a quick preview.
        const textPreview = await file.slice(0, 1024).text();

        // 2. Parse the full file with PapaParse
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                console.log(`File ${fileType} Parsed:`, results.data);

                // Update the correct Svelte variables,
                // which will automatically update the UI.
                if (fileType === 'A') {
                    dataA = results.data;
                    headersA = results.meta.fields;
                    selectedKeyA = headersA[0]; // Auto-select first header
                    previewA = textPreview;
                } else {
                    dataB = results.data;
                    headersB = results.meta.fields;
                    selectedKeyB = headersB[0]; // Auto-select first header
                    previewB = textPreview;
                }
            },
            error: (error) => console.error(`Error parsing File ${fileType}:`, error.message)
        });
    }



    /**
     * This is our main "VLOOKUP" function from Week 1.
     * It's almost identical.
     */
    function runComparison() {

        // --- PAYWALL CHECK ---
        // Check if either file exceeds the free tier limit
        if (dataA.length > FREE_TIER_LIMIT || dataB.length > FREE_TIER_LIMIT) {
            console.warn(`Paywall triggered. File A: ${dataA.length} rows, File B: ${dataB.length} rows.`);
            showUpgradeModal = true; // Show the modal
            return; // Stop the function from running
        }
        // --- END PAYWALL CHECK ---

        console.log("--- Running Comparison ---"); // This line should NOT be reached

        if (!selectedKeyA || !selectedKeyB) {
            console.error("Please select match keys for both files.");
            return;
        }
        
        console.log(`Matching File A on key "${selectedKeyA}" with File B on key "${selectedKeyB}"`);

        // Create a fast lookup map from File B
        const lookupMapB = new Map();
        for (const row of dataB) {
            const lookupValue = row[selectedKeyB];
            if (lookupValue !== null && lookupValue !== undefined) {
                lookupMapB.set(String(lookupValue), row); // Convert key to string for safety
            }
        }
        console.log("Created lookup map from File B:", lookupMapB);

        // Iterate through File A and perform the lookup
        matches = [];
        mismatchesA = []; // In A, not in B

        for (const rowA of dataA) {
            const lookupValue = String(rowA[selectedKeyA]); // Convert key to string
            const matchInB = lookupMapB.get(lookupValue);

            if (matchInB) {
                const mergedRow = { ...rowA, ...matchInB };
                matches.push(mergedRow);
            } else {
                mismatchesA.push(rowA);
            }
        }

        // Find items in B not in A
        const lookupMapA = new Map();
        for (const row of dataA) {
            lookupMapA.set(String(row[selectedKeyA]), row); // Convert key to string
        }
        
        mismatchesB = []; // In B, not in A
        for (const rowB of dataB) {
            const lookupValue = String(rowB[selectedKeyB]);
            if (!lookupMapA.has(lookupValue)) {
                mismatchesB.push(rowB);
            }
        }

    // --- Update State with Results ---
    // Svelte's reactivity will automatically update the UI
    // when we assign these new array values.

    // We use the spread operator '...' to create a new array,
    // which guarantees Svelte detects the change.
    matches = [...matches];
    mismatchesA = [...mismatchesA];
    mismatchesB = [...mismatchesB];

    // Set up headers for the results table
    // We'll just use the headers from the 'matches' array (which is a merge)
    if (matches.length > 0) {
        resultsHeaders = Object.keys(matches[0]);
    } else if (mismatchesA.length > 0) {
        resultsHeaders = Object.keys(mismatchesA[0]);
    } else if (mismatchesB.length > 0) {
        resultsHeaders = Object.keys(mismatchesB[0]);
}

hasResults = true; // Show the results section
activeTab = 'matches'; // Default to the 'matches' tab

console.log("--- Comparison Complete. Results are now in state. ---");
console.log("Matches:", matches);
console.log("Mismatches A:", mismatchesA);
console.log("Mismatches B:", mismatchesB);
    }
</script>

<main>
    <h1>Data Merge Tool</h1>
    <p>Upload two CSV files, select the columns to match, and run the comparison.</p>

    <div class="container">
        <div class="card">
            <h2>File A (Main File)</h2>
            <input 
                type="file" 
                accept=".csv" 
                on:change={(event) => handleFile(event, 'A')} 
            />
            
            {#if headersA.length > 0}
                <div class="controls">
                    <label for="keyA">Match on column:</label>
                    <select id="keyA" bind:value={selectedKeyA}>
                        {#each headersA as header}
                            <option value={header}>{header}</option>
                        {/each}
                    </select>
                </div>

                <div class="preview-box">
                    <strong>Preview:</strong>
                    <pre>{previewA}</pre>
                </div>
            {/if}
        </div>

        <div class="card">
            <h2>File B (Lookup File)</h2>
            <input 
                type="file" 
                accept=".csv" 
                on:change={(event) => handleFile(event, 'B')} 
            />

            {#if headersB.length > 0}
                <div class="controls">
                    <label for="keyB">Match on column:</label>
                    <select id="keyB" bind:value={selectedKeyB}>
                        {#each headersB as header}
                            <option value={header}>{header}</option>
                        {/each}
                    </select>
                </div>

                <div class="preview-box">
                    <strong>Preview:</strong>
                    <pre>{previewB}</pre>
                </div>
            {/if}
        </div>
    </div>

    <div class="run-section">
        <button 
            on:click={runComparison} 
            disabled={!isReady}
        >
            {#if isReady}
                Run Comparison
            {:else}
                Upload both files to run
            {/if}
        </button>
    </div>
    {#if hasResults}
        <section class="results-section">
            <h2>Results</h2>

            <div class="tabs">
                <button 
                    class="tab-button" 
                    class:active={activeTab === 'matches'}
                    on:click={() => activeTab = 'matches'}
                >
                    ✅ Matches ({matches.length})
                </button>
                <button 
                    class="tab-button"
                    class:active={activeTab === 'mismatchesA'}
                    on:click={() => activeTab = 'mismatchesA'}
                >
                    ❌ In File A only ({mismatchesA.length})
                </button>
                <button 
                    class="tab-button"
                    class:active={activeTab === 'mismatchesB'}
                    on:click={() => activeTab = 'mismatchesB'}
                >
                    ❌ In File B only ({mismatchesB.length})
                </button>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            {#each resultsHeaders as header}
                                <th>{header}</th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody>
                        {#if activeTab === 'matches'}
                            {#each matches as row}
                                <tr>
                                    {#each resultsHeaders as header}
                                        <td>{row[header]}</td>
                                    {/each}
                                </tr>
                            {/each}
                        {:else if activeTab === 'mismatchesA'}
                            {#each mismatchesA as row}
                                <tr>
                                    {#each resultsHeaders as header}
                                        <td>{row[header]}</td>
                                    {/each}
                                </tr>
                            {/each}
                        {:else if activeTab === 'mismatchesB'}
                            {#each mismatchesB as row}
                                <tr>
                                    {#each resultsHeaders as header}
                                        <td>{row[header]}</td>
                                    {/each}
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>
        </section>
    {/if}
    {#if showUpgradeModal}
        <div class="modal-backdrop" on:click={() => showUpgradeModal = false}>
            <div class="modal" on:click|stopPropagation>
                <h2>Free Limit Reached</h2>
                <p>
                    Your file has more than {FREE_TIER_LIMIT} rows.
                </p>
                <p>
                    To process unlimited rows, support for XLSX files, and save mapping templates,
                    please upgrade to <strong>Pro</strong>.
                </p>

                <a 
                    href="https://www.payfast.co.za" 
                    target="_blank" 
                    class="payfast-button"
                >
                    Upgrade to Pro (R...ZAR)
                </a>

                <button class="modal-close" on:click={() => showUpgradeModal = false}>
                    &times;
                </button>
            </div>
        </div>
    {/if}
</main>

<style>
    /* We add 'global' to style the main body tag */
    :global(body) {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background-color: #f4f7f6;
        color: #333;
        margin: 0;
        padding: 2rem;
    }

    main {
        max-width: 900px;
        margin: 0 auto;
    }

    h1 {
        color: #2c3e50;
    }

    .container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
    }

    .card {
        background: #ffffff;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .controls {
        margin-top: 1rem;
    }

    select {
        width: 100%;
        padding: 0.5rem;
        margin-top: 0.5rem;
        border-radius: 4px;
        border: 1px solid #ccc;
    }
    
    .preview-box {
        margin-top: 1rem;
        background-color: #fafafa;
        border: 1px solid #eee;
        border-radius: 4px;
        padding: 0.5rem 1rem;
    }

    /* 'pre' is for pre-formatted text, perfect for code/CSV previews */
    pre {
        white-space: pre-wrap; /* Wrap long lines */
        word-break: break-all; /* Break long words */
        font-size: 0.8rem;
        max-height: 100px;
        overflow-y: auto;
    }

    .run-section {
        text-align: center;
        margin-top: 2rem;
    }

    button {
        font-size: 1rem;
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        background-color: #3498db;
        color: white;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    button:hover {
        background-color: #2980b9;
    }

    /* This style is applied when the button's 'disabled' attribute is true */
    button:disabled {
        background-color: #bdc3c7;
        cursor: not-allowed;
    }

    /* Make it responsive on smaller screens */
    @media (max-width: 700px) {
        .container {
            grid-template-columns: 1fr;
        }
    }
    /* --- Results Section Styles --- */
    .results-section {
        margin-top: 2rem;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        overflow: hidden; /* This is key for the table container */
    }

    .results-section h2 {
        padding: 1.5rem 1.5rem 0 1.5rem;
        margin: 0;
    }

    .tabs {
        display: flex;
        padding: 0 1.5rem;
        border-bottom: 1px solid #eee;
    }

    .tab-button {
        padding: 1rem 1.25rem;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 500;
        color: #555;
        border-bottom: 3px solid transparent;
        margin-bottom: -1px; /* Aligns with the parent border */
    }

    .tab-button:hover {
        background-color: #f9f9f9;
    }

    /* This 'active' class is toggled by Svelte */
    .tab-button.active {
        color: #3498db;
        border-bottom-color: #3498db;
    }

    .table-container {
        width: 100%;
        max-height: 500px; /* Make the table scrollable */
        overflow: auto; /* Adds scrollbars only if needed */
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
    }

    .data-table th,
    .data-table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #f0f0f0;
        white-space: nowrap; /* Prevents text from wrapping */
    }

    .data-table th {
        background-color: #fcfcfc;
        font-weight: 600;
        position: sticky; /* Makes headers stick on scroll */
        top: 0;
    }

    .data-table tr:last-child td {
        border-bottom: none;
    }

    .data-table tr:hover {
        background-color: #f9f9f9;
    }
    /* --- Modal Styles --- */
    .modal-backdrop {
        position: fixed; /* Sits on top of everything */
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
    }

    .modal {
        background: #fff;
        border-radius: 8px;
        padding: 2rem;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        position: relative; /* For the close button */
    }

    .modal h2 {
        margin-top: 0;
    }

    .modal-close {
        position: absolute;
        top: 0.5rem;
        right: 0.75rem;
        font-size: 2rem;
        font-weight: bold;
        color: #aaa;
        background: none;
        border: none;
        cursor: pointer;
    }

    .payfast-button {
        display: inline-block;
        background-color: #22a04a; /* Payfast-ish Green */
        color: #fff;
        font-weight: 600;
        text-decoration: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        margin-top: 1rem;
        transition: background-color 0.2s ease;
    }

    .payfast-button:hover {
        background-color: #1b803a;
    }
</style>