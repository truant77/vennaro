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

    // --- Reactive Variables ---
    // This 'isReady' variable will automatically re-calculate
    // whenever dataA or dataB changes. We use it to enable/disable the button.
    $: isReady = dataA && dataB;

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
        console.log("--- Running Comparison ---");

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
        const matches = [];
        const mismatchesA = []; // In A, not in B

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
        
        const mismatchesB = []; // In B, not in A
        for (const rowB of dataB) {
            const lookupValue = String(rowB[selectedKeyB]);
            if (!lookupMapA.has(lookupValue)) {
                mismatchesB.push(rowB);
            }
        }

        // Log the final results to the console (for now).
        // In our next step, we will display this in the UI.
        console.log("--- Comparison Results ---");
        console.log(`✅ Matches Found: ${matches.length}`, matches);
        console.log(`❌ In File A (not in B): ${mismatchesA.length}`, mismatchesA);
        console.log(`❌ In File B (not in A): ${mismatchesB.length}`, mismatchesB);

        // We can show a simple alert to prove it worked
        alert(`Comparison Complete!\n\nMatches: ${matches.length}\nIn A, not B: ${mismatchesA.length}\nIn B, not A: ${mismatchesB.length}\n\n(Check console for full data)`);
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
</style>