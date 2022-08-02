"use strict";

const fs = require("fs");

const NORMALIZE = process.argv.length < 4
	? false
	: process.argv[2] === "--normalize";

const FILE = process.argv.length < 4
	? process.argv[2]
	: process.argv[3];

const DATE_OFFSET = 4;
const WIDTH = 27;
const BUILD_PATH = Buffer.from(":\\ring");
const DRIVE_LETTER = "P";

const FILE_DATA = fs.readFileSync(FILE);

if (NORMALIZE) {
	clearDate(FILE_DATA);
	normalizePaths(FILE_DATA);
}

printHex(FILE_DATA);

// Set the build date to the unix epoch
function clearDate(data) {
	const date = new Date(1000 * data.readUint32LE(4));

	// Attempt to validate by checking the date was reasonable
	if (date.getFullYear() < 2021 || date > new Date()) {
		throw new Error(`Unexpected date in COFF header: ${date}`);
	}

	// Zero out the date
	if (NORMALIZE) {
		data.writeUint32LE(0, DATE_OFFSET);
	}
}

// Replace instances of `[A-Z]:\ring` with `P:\ring`
function normalizePaths(data) {
	const A = "A".charCodeAt(0);
	const Z = "Z".charCodeAt(0);

	while (true) {
		const i = data.indexOf(BUILD_PATH);

		if (i < 0) {
			break;
		} else if (data[i - 1] >= A && data[i - 1] <= Z) {
			data[i - 1] = DRIVE_LETTER;
		}

		data = data.subarray(i + 1);
	}
}

function printHex(data) {
	while (data.length) {
		const line = data
			.subarray(0, WIDTH)
			.toString("hex")
			.replace(/(..)(?=.)/g, "$1 ");

		console.log(line);
		data = data.subarray(WIDTH);
	}
}
