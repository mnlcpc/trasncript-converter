#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Ensure an input file is provided
if (process.argv.length < 3) {
  console.error("Usage: transcription-to-csv <input.json>");
  process.exit(1);
}

const inputFile = process.argv[2];

let data;
// Read and parse the JSON file
try {
  data = JSON.parse(fs.readFileSync(inputFile, "utf8"));
} catch (err) {
  console.error("Error reading or parsing file:", err);
  process.exit(1);
}

// Ensure the expected structure is present (ignore full-transcript if exists)
if (!data.transcription || !Array.isArray(data.transcription.utterances)) {
  console.error("Invalid file: transcription.utterances not found");
  process.exit(1);
}

const utterances = data.transcription.utterances;
const csvRows = [];
// CSV header row: speaker, line, start_time, end_time
csvRows.push("speaker,line,start_time,end_time");

// Helper to convert speaker number to a text label (e.g. 0 -> "Speaker One")
function convertSpeaker(speakerNum) {
  const ordinals = [
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
  ];
  if (speakerNum < ordinals.length) {
    return "Speaker " + ordinals[speakerNum];
  }
  return "Speaker " + (speakerNum + 1);
}

// Merge consecutive utterances if they are from the same speaker
const mergedUtterances = [];
utterances.forEach((u) => {
  if (
    mergedUtterances.length > 0 &&
    mergedUtterances[mergedUtterances.length - 1].speaker === u.speaker
  ) {
    // If the previous utterance is from the same speaker, merge the text (with a space) and update end time.
    mergedUtterances[mergedUtterances.length - 1].text += " " + u.text;
    mergedUtterances[mergedUtterances.length - 1].end = u.end;
  } else {
    // Create a copy of the utterance
    mergedUtterances.push(Object.assign({}, u));
  }
});

// Process the merged utterances to create CSV rows
mergedUtterances.forEach((u) => {
  const speaker = convertSpeaker(u.speaker);
  // Remove potential newlines and escape double quotes in text
  let line = u.text.replace(/"/g, '""').replace(/[\r\n]+/g, " ");
  const start_time = u.start;
  const end_time = u.end;
  csvRows.push(`${speaker},"${line}",${start_time},${end_time}`);
});

// Join rows with newlines
const csvContent = csvRows.join("\n");

// Create output filename based on input file name with .csv extension
const outputFile = path.join(
  path.dirname(inputFile),
  `${path.basename(inputFile, path.extname(inputFile))}.csv`
);

// Write the CSV file
fs.writeFileSync(outputFile, csvContent, "utf8");
console.log(`CSV file written to ${outputFile}`);
