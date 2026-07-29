import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

const filePath = path.join(
  "d:/journey/Suggestion-System-dcci/suggestions-system-dcci/public/templates",
  "FR.MI-001-26 Form Suggestion System.xlsx"
);

const workbook = XLSX.readFile(filePath);

console.log("=== SHEET NAMES ===");
console.log(workbook.SheetNames);
console.log("\n");

workbook.SheetNames.forEach((sheetName) => {
  console.log(`\n=== SHEET: "${sheetName}" ===`);
  const sheet = workbook.Sheets[sheetName];
  
  // Get the range of the sheet
  const range = sheet["!ref"];
  console.log(`Range: ${range}`);
  
  // Print all cells with values
  if (range) {
    const decoded = XLSX.utils.decode_range(range);
    for (let row = decoded.s.r; row <= Math.min(decoded.e.r, 60); row++) {
      let rowData: string[] = [];
      for (let col = decoded.s.c; col <= decoded.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = sheet[cellAddr];
        rowData.push(cell ? String(cell.v ?? "") : "");
      }
      // Only print non-empty rows
      const filtered = rowData.filter(v => v !== "");
      if (filtered.length > 0) {
        console.log(`Row ${row + 1}: ${JSON.stringify(rowData)}`);
      }
    }
  }
});
