'use strict';

console.log("app.js loaded. Prototype is running.");

// Get references to our HTML elements
const fileInputA = document.getElementById('fileA');
const fileInputB = document.getElementById('fileB');
const keySelectA = document.getElementById('keyA');
const keySelectB = document.getElementById('keyB');
const runButton = document.getElementById('runButton');

// We will store our parsed data here
let dataA = null;
let headersA = null;
let dataB = null;
let headersB = null;

// --- Event Listeners ---

fileInputA.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
            console.log("File A Parsed:", results.data);
            dataA = results.data;
            headersA = results.meta.fields; // Get the header names
            populateKeySelector(keySelectA, headersA);
            checkReadyToRun();
        },
        error: (error) => console.error("Error parsing File A:", error.message)
    });
});

fileInputB.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
            console.log("File B Parsed:", results.data);
            dataB = results.data;
            headersB = results.meta.fields; // Get the header names
            populateKeySelector(keySelectB, headersB);
            checkReadyToRun();
        },
        error: (error) => console.error("Error parsing File B:", error.message)
    });
});

runButton.addEventListener('click', () => {
    if (dataA && dataB) {
        runComparison();
    } else {
        console.error("Data is not ready.");
    }
});

// --- Core Functions ---

/**
 * Populates a <select> dropdown with column headers.
 * @param {HTMLSelectElement} selector - The <select> element to populate.
 * @param {string[]} headers - An array of header strings.
 */
function populateKeySelector(selector, headers) {
    selector.innerHTML = ''; // Clear existing options
    headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        selector.appendChild(option);
    });
}

/**
 * Checks if both files are loaded and enables the run button.
 */
function checkReadyToRun() {
    if (dataA && dataB) {
        runButton.disabled = false;
        runButton.textContent = "Run Comparison";
    }
}

/**
 * This is our main "VLOOKUP" function.
 */
function runComparison() {
    console.log("--- Running Comparison ---");

    const keyA = keySelectA.value;
    const keyB = keySelectB.value;

    if (!keyA || !keyB) {
        console.error("Please select match keys for both files.");
        return;
    }
    
    console.log(`Matching File A on key "${keyA}" with File B on key "${keyB}"`);

    // For performance, we'll create a "lookup map" from File B.
    // This is much faster (O(n)) than looping inside a loop (O(n^2)).
    const lookupMapB = new Map();
    for (const row of dataB) {
        const lookupValue = row[keyB];
        if (lookupValue !== null && lookupValue !== undefined) {
            lookupMapB.set(lookupValue, row);
        }
    }
    console.log("Created lookup map from File B:", lookupMapB);

    // Now, iterate through File A and perform the lookup.
    const matches = [];
    const mismatchesA = []; // In A, not in B

    for (const rowA of dataA) {
        const lookupValue = rowA[keyA];
        const matchInB = lookupMapB.get(lookupValue);

        if (matchInB) {
            // Found a match! We'll merge the objects.
            const mergedRow = { ...rowA, ...matchInB };
            matches.push(mergedRow);
        } else {
            // No match found in B.
            mismatchesA.push(rowA);
        }
    }

    // We also need to find items in B that were not in A.
    // We can do this by comparing the size of our original dataB
    // with the number of matches we found. (This is a simplified way).
    
    // A more accurate way to find items in B not in A:
    const lookupMapA = new Map();
    for (const row of dataA) {
        lookupMapA.set(row[keyA], row);
    }
    
    const mismatchesB = []; // In B, not in A
    for (const rowB of dataB) {
        const lookupValue = rowB[keyB];
        if (!lookupMapA.has(lookupValue)) {
            mismatchesB.push(rowB);
        }
    }

    // Log the final results to the console.
    console.log("--- Comparison Results ---");
    console.log(`✅ Matches Found: ${matches.length}`, matches);
    console.log(`❌ In File A (not in B): ${mismatchesA.length}`, mismatchesA);
    console.log(`❌ In File B (not in A): ${mismatchesB.length}`, mismatchesB);
}