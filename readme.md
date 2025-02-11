# Transcription to CSV converter

This very simple script converts a transcription in JSON file format with a strcutre common for dialog inference and speaker diarization output,
into to a CSV file with the following columns:

- speaker
- line
- start_time
- end_time

So that the CSV file can be imported into Eleven Labs.

## Usage

It is intended to be used as a command line tool.

```bash
transcription-to-csv.js <input_file>
```

The program will output a CSV file with the same name as the input file in the same directory.
