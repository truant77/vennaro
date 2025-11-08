<script>
  
	// ---------------------------------
	// STEP 1: SCRIPT (SVELTE 5)
	// ---------------------------------
	import * as Papa from 'papaparse';
	import { tick } from 'svelte';
	import PayfastButton from '$lib/components/PayfastButton.svelte';
	import logo from '$lib/assets/icon-512.png';

	// --- Svelte 5 State Variables ---
	// We must use $state() to make variables reactive
	let dataA = $state(null);
	let headersA = $state([]);
	let previewA = $state('');
	let filenameA = $state('');
	let selectedKeyA = $state('');

	let dataB = $state(null);
	let headersB = $state([]);
	let previewB = $state('');
	let filenameB = $state('');
	let selectedKeyB = $state('');

	// --- Result State Variables ---
	let matches = $state([]);
	let mismatchesA = $state([]);
	let mismatchesB = $state([]);
	let activeTab = $state('matches');
	let resultsHeaders = $state([]);
	let hasResults = $state(false);

	// --- Paywall State ---
	let showUpgradeModal = $state(false);
	const FREE_TIER_LIMIT = 1000;

	// --- Svelte 5 Derived State ---
	// This replaces $: isReady
	let isReady = $derived(dataA && dataB);

	// --- Element Bindings ---
	let resultsHeading = $state(null);

	/**
	 * Handles file parsing for either File A or File B.
	 */
	async function handleFile(event, fileType) {
		const file = event.target.files[0];
		if (!file) return;
		const filename = file.name;

		// 1. Generate the text preview
		const textPreview = await file.slice(0, 1024).text();

		// 2. Parse the full file with PapaParse
		Papa.parse(file, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true,
			complete: (results) => {
				console.log(`File ${fileType} Parsed:`, results.data);

				if (fileType === 'A') {
					dataA = results.data;
					headersA = results.meta.fields;
					selectedKeyA = headersA[0];
					previewA = textPreview;
					filenameA = filename;
				} else {
					dataB = results.data;
					headersB = results.meta.fields;
					selectedKeyB = headersB[0];
					previewB = textPreview;
					filenameB = filename;
				}
			},
			error: (error) => console.error(`Error parsing File ${fileType}:`, error.message)
		});
	}

	/**
	 * Resets all state variables for a given file type (A or B).
	 */
	function resetFile(fileType) {
		if (fileType === 'A') {
			dataA = null;
			headersA = [];
			previewA = '';
			selectedKeyA = '';
			filenameA = '';
		} else {
			dataB = null;
			headersB = [];
			previewB = '';
			selectedKeyB = '';
			filenameB = '';
		}

		// If we remove a file, any previous results are now invalid
		hasResults = false;
		matches = [];
		mismatchesA = [];
		mismatchesB = [];
	}

	/**
	 * This is our main "VLOOKUP" function.
	 */
	async function runComparison() {
		// --- PAYWALL CHECK ---
		if (dataA.length > FREE_TIER_LIMIT || dataB.length > FREE_TIER_LIMIT) {
			console.warn(`Paywall triggered. File A: ${dataA.length} rows, File B: ${dataB.length} rows.`);
			showUpgradeModal = true;
			return;
		}
		// --- END PAYWALL CHECK ---

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
				lookupMapB.set(String(lookupValue), row);
			}
		}
		console.log("Created lookup map from File B:", lookupMapB);

		// Iterate through File A and perform the lookup
		let newMatches = [];
		let newMismatchesA = [];

		for (const rowA of dataA) {
			const lookupValue = String(rowA[selectedKeyA]);
			const matchInB = lookupMapB.get(lookupValue);

			if (matchInB) {
				const mergedRow = { ...rowA, ...matchInB };
				newMatches.push(mergedRow);
			} else {
				newMismatchesA.push(rowA);
			}
		}

		// Find items in B not in A
		const lookupMapA = new Map();
		for (const row of dataA) {
			lookupMapA.set(String(row[selectedKeyA]), row);
		}

		let newMismatchesB = [];
		for (const rowB of dataB) {
			const lookupValue = String(rowB[selectedKeyB]);
			if (!lookupMapA.has(lookupValue)) {
				newMismatchesB.push(rowB);
			}
		}

		// --- Update State with Results ---
		matches = newMatches;
		mismatchesA = newMismatchesA;
		mismatchesB = newMismatchesB;

		// Set up headers for the results table
		if (matches.length > 0) {
			resultsHeaders = Object.keys(matches[0]);
		} else if (mismatchesA.length > 0) {
			resultsHeaders = Object.keys(mismatchesA[0]);
		} else if (mismatchesB.length > 0) {
			resultsHeaders = Object.keys(mismatchesB[0]);
		}

		hasResults = true;
		activeTab = 'matches';

		// Auto-scroll to results
		await tick();
		resultsHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });

		console.log("--- Comparison Complete. Results are now in state. ---");
		console.log("Matches:", matches);
		console.log("Mismatches A:", mismatchesA);
		console.log("Mismatches B:", mismatchesB);
	}

	/**
	 * Handles downloading the currently active result set as a CSV file.
	 */
	function downloadResults() {
		let dataToExport = [];
		let filename = 'results.csv';

		if (activeTab === 'matches') {
			dataToExport = matches;
			filename = 'matches.csv';
		} else if (activeTab === 'mismatchesA') {
			dataToExport = mismatchesA;
			filename = 'mismatches_file_A.csv';
		} else if (activeTab === 'mismatchesB') {
			dataToExport = mismatchesB;
			filename = 'mismatches_file_B.csv';
		}

		if (dataToExport.length === 0) {
			alert("There's no data in this view to download.");
			return;
		}

		// Convert the array of objects back into a CSV string
		const csvString = Papa.unparse(dataToExport);

		// Create a "virtual" link to trigger the download
		const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);

		link.setAttribute('href', url);
		link.setAttribute('download', filename);
		link.style.visibility = 'hidden';

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
  
</script>

<main>
    <a href="/" aria-label="Go to Homepage" class="logo-link">
        <img src={logo} alt="Data Merge Logo" class="logo" />
    </a>

    <h1>Data Merge Tool</h1>
    <p>Upload two CSV files, select the columns to match, and run the comparison.</p>

    <div class="page-links">
    <a 
        href="https://forms.gle/uGXSuYcz1kZxgcvq9" 
        target="_blank" 
        class="feedback-link"
    >
        Got an idea or found a bug? Let us know!
    </a>
    <a href="/roadmap" class="feedback-link">
        See our Public Roadmap
    </a>
    </div>

    <div class="container">
        <div class="card">
            <h2>File A (Main File)</h2>
        
            {#if !dataA}
                <input 
                    type="file" 
                    accept=".csv" 
                    onchange={(event) => handleFile(event, 'A')} 
                />
            {:else}
            <div class="file-info-header">
                <span class="success-icon">✓</span>
                <strong class="filename" title={filenameA}>{filenameA}</strong>
                <button 
                    onclick={() => resetFile('A')} 
                    class="remove-button-subtle" 
                    title="Remove file"
                >
                    &times;
                </button>
            </div>
        
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
        
            {#if !dataB}
                <input 
                    type="file" 
                    accept=".csv" 
                    onchange={(event) => handleFile(event, 'B')} 
                />
            {:else}
            <div class="file-info-header">
                <span class="success-icon">✓</span>
                <strong class="filename" title={filenameB}>{filenameB}</strong>
                <button 
                    onclick={() => resetFile('B')} 
                    class="remove-button-subtle" 
                    title="Remove file"
                >
                    &times;
                </button>
            </div>
        
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
            onclick={runComparison} 
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
            <h2 bind:this={resultsHeading}>Results</h2>

            <div class="tabs">
                <button 
                    class="tab-button" 
                    class:active={activeTab === 'matches'}
                    onclick={() => activeTab = 'matches'}
                >
                    ✅ Matches ({matches.length})
                </button>
                <button 
                    class="tab-button"
                    class:active={activeTab === 'mismatchesA'}
                    onclick={() => activeTab = 'mismatchesA'}
                >
                    ❌ In File A only ({mismatchesA.length})
                </button>
                <button 
                    class="tab-button"
                    class:active={activeTab === 'mismatchesB'}
                    onclick={() => activeTab = 'mismatchesB'}
                >
                    ❌ In File B only ({mismatchesB.length})
                </button>
            </div>
            
            <div class="download-section">
                <button onclick={downloadResults} class="download-button">
                    Download Current Tab
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
        <div class="modal-backdrop" onclick={() => showUpgradeModal = false} role="button" tabindex="0">
            <div class="modal" onclick={(event) => event.stopPropagation()}>
                <h2>Free Limit Reached</h2>
                <p>
                    Your file has more than {FREE_TIER_LIMIT} rows.
                </p>
                <p>
                    To process unlimited rows, support for XLSX files, and save mapping templates,
                    please upgrade to <strong>Pro</strong>.
                </p>

                <PayfastButton class="payfast-button">
                    Upgrade to Pro (R79.99/mo)
                </PayfastButton>

                <button class="modal-close" onclick={() => showUpgradeModal = false}>
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
        text-align: center;
    }
    p {
        text-align: center;
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

    .file-info-header {
        display: flex;
        align-items: center;
        gap: 0.5rem; /* Space between icon, name, and button */
        background-color: #f9f9f9;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
    }

    .remove-button-subtle {
        background: none;
        border: none;
        color: #95a5a6; /* Subtle grey */
        font-size: 1.25rem;
        font-weight: bold;
        cursor: pointer;
        padding: 0 0.25rem;
        border-radius: 4px;
        margin-left: auto; /* Pushes it to the far right */
        line-height: 1;
        transition: background-color 0.2s, color 0.2s;
    }

    .remove-button-subtle:hover {
        background-color: #ecf0f1; /* Light grey on hover */
        color: #e74c3c; /* Red... but only on hover */
    }

    .success-icon {
    color: #27ae60; /* Green */
    font-weight: bold;
    font-size: 1.1rem;
    }

    .filename {
        flex-grow: 1; /* Takes up remaining space */
        font-size: 0.9rem;
        color: #333;

        /* Prevents long filenames from breaking the layout */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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

   /* Add this for the logo */
    .logo {
        width: 60px;
        height: 60px;
        display: block;
        margin: 0 auto 1rem auto;
    }

    .logo-link {
        display: block; /* Makes the whole block clickable */
        text-decoration: none; /* Removes underline */
        margin-bottom: 1rem;
    }
    /* Add this for the feedback link */
    .feedback-link {
        display: inline-block;
        font-size: 0.9rem;
        font-weight: 600;
        color: white; /* White text */
        background-color: #3498db; /* Blue background */
        border: none; /* No border */
        padding: 0.5rem 1rem;
        border-radius: 6px;
        text-decoration: none;
        transition: background-color 0.2s ease, transform 0.1s ease;
    }

    .feedback-link:hover {
        background-color: #2980b9; /* Darker blue on hover */
        transform: translateY(-1px);
    }
    .page-links {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.75rem; /* Adds a bit of space */
        margin-bottom: 1.5rem;
    }

    .download-section {
        padding: 1rem 1.5rem;
        background-color: #f9f9f9;
        border-bottom: 1px solid #eee;
        text-align: right; /* Aligns button to the right */
    }

    .download-button {
        font-size: 0.9rem;
        font-weight: 600;
        color: white;
        background-color: #3498db;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        text-decoration: none;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .download-button:hover {
        background-color: #2980b9;
    }
</style>