import * as XLSX from "xlsx";
import * as path from "path";

const filePath = path.join(
  "d:/journey/Suggestion-System-dcci/suggestions-system-dcci/public/templates",
  "FR.MI-001-26 Form Suggestion System.xlsx"
);

const workbook = XLSX.readFile(filePath);

// Focus on "Form" sheet - dump ALL cells with addresses
const sheet = workbook.Sheets["Form"];
const range = sheet["!ref"];
console.log(`Range: ${range}`);
console.log("\n=== ALL CELLS IN FORM SHEET ===");

if (range) {
  const decoded = XLSX.utils.decode_range(range);
  for (let row = decoded.s.r; row <= decoded.e.r; row++) {
    for (let col = decoded.s.c; col <= decoded.e.c; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = sheet[cellAddr];
      if (cell && cell.v !== undefined && cell.v !== "") {
        console.log(`  ${cellAddr} = "${cell.v}" (type: ${cell.t})`);
      }
    }
  }
}

// Also dump merged cells
console.log("\n=== MERGED CELLS ===");
if (sheet["!merges"]) {
  sheet["!merges"].forEach((merge: any, i: number) => {
    const s = XLSX.utils.encode_cell(merge.s);
    const e = XLSX.utils.encode_cell(merge.e);
    console.log(`  Merge ${i}: ${s}:${e}`);
  });
}
