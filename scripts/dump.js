const ExcelJS = require('exceljs');

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('./public/templates/FR.MI-001-26 Form Suggestion System.xlsx');
  const sheet = wb.getWorksheet('Form');
  for(let r=40; r<=46; r++) {
    const row = sheet.getRow(r);
    let rowData = [];
    row.eachCell({includeEmpty: true}, (cell, c) => {
      // get the master cell for merges
      const master = sheet.getCell(cell.address).master;
      if (master.address === cell.address && cell.value) {
        rowData.push(cell.address + '="' + cell.value + '"');
      } else if (!master || master.address === cell.address) {
        // rowData.push(cell.address + '=[E]');
      }
    });
    if (rowData.length > 0) console.log(rowData.join(', '));
  }
})();
