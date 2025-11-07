// This is a Node.js script.
// Run it with: node generate_data.js

import fs from 'fs';
import crypto from 'crypto';

console.log('--- Starting Data Generation ---');

/**
 * Generates a random string for dummy data.
 */
function randomData() {
    return crypto.randomBytes(4).toString('hex');
}

/**
 * Creates a CSV file.
 * @param {string} filename - The name of the file to create.
 *A @param {string[]} headers - An array of header strings.
 * @param {string[][]} rows - An array of rows, where each row is an array of strings.
 */
function writeCsv(filename, headers, rows) {
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.join(',') + '\n';
    });
    fs.writeFileSync(filename, csvContent);
    console.log(`✅ Successfully created ${filename} with ${rows.length} rows.`);
}

// --- Main Script ---

// --- Generate File A (The "Main" File) ---
const headersA = ['employee_id'];
for (let i = 1; i <= 20; i++) {
    headersA.push(`a_data_${i}`);
}

const rowsA = [];
// Create 600 rows with IDs 1 through 600
for (let id = 1; id <= 600; id++) {
    const row = [String(id)];
    for (let i = 1; i <= 20; i++) {
        row.push(randomData());
    }
    rowsA.push(row);
}
writeCsv('file_A.csv', headersA, rowsA);


// --- Generate File B (The "Lookup" File) ---
const headersB = ['emp_id']; // Use a different key name for a real test
for (let i = 1; i <= 20; i++) {
    headersB.push(`b_data_${i}`);
}

const rowsB = [];
// Create 500 rows with IDs 1 through 500 (these will match File A)
for (let id = 1; id <= 500; id++) {
    const row = [String(id)];
    for (let i = 1; i <= 20; i++) {
        row.push(randomData());
    }
    rowsB.push(row);
}

// Create 50 more rows with IDs 601 through 650 (these will not match)
for (let id = 601; id <= 650; id++) {
    const row = [String(id)];
    for (let i = 1; i <= 20; i++) {
        row.push(randomData());
    }
    rowsB.push(row);
}
writeCsv('file_B.csv', headersB, rowsB);

console.log('--- Data Generation Complete! ---');