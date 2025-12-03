const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Read the Excel files
const candoPath = path.join(__dirname, '../src/data/JFstandard-Cando.xlsx');
const sentencePath = path.join(__dirname, '../src/data/sentence_patterns_list.xlsx');
const wordlistPath = path.join(__dirname, '../src/data/wordlist_all.xlsx');

console.log('=== Reading JF Standard Cando ===');
const candoWorkbook = XLSX.readFile(candoPath);
candoWorkbook.SheetNames.forEach(sheetName => {
  console.log(`\n--- Sheet: ${sheetName} ---`);
  const sheet = candoWorkbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Show first 20 rows
  console.log('Headers:', data[0]);
  console.log('\nSample rows:');
  for (let i = 1; i < Math.min(data.length, 15); i++) {
    console.log(`Row ${i}:`, data[i]);
  }
  console.log(`\nTotal rows: ${data.length}`);
});

console.log('\n\n=== Reading Sentence Patterns ===');
const sentenceWorkbook = XLSX.readFile(sentencePath);
sentenceWorkbook.SheetNames.forEach(sheetName => {
  console.log(`\n--- Sheet: ${sheetName} ---`);
  const sheet = sentenceWorkbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log('Headers:', data[0]);
  console.log('\nSample rows:');
  for (let i = 1; i < Math.min(data.length, 10); i++) {
    console.log(`Row ${i}:`, data[i]);
  }
  console.log(`\nTotal rows: ${data.length}`);
});

console.log('\n\n=== Reading Wordlist ===');
const wordlistWorkbook = XLSX.readFile(wordlistPath);
wordlistWorkbook.SheetNames.forEach(sheetName => {
  console.log(`\n--- Sheet: ${sheetName} ---`);
  const sheet = wordlistWorkbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log('Headers:', data[0]);
  console.log('\nSample rows:');
  for (let i = 1; i < Math.min(data.length, 10); i++) {
    console.log(`Row ${i}:`, data[i]);
  }
  console.log(`\nTotal rows: ${data.length}`);
});
