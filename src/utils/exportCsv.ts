export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Headers
  csvRows.push(headers.join(','));
  
  // Rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const exportToExcel = (data: any[], filename: string) => {
  // A simple hack to export data as excel is to create an HTML table and save as .xls
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  let tableHTML = '<table><thead><tr>';
  
  headers.forEach(header => {
    tableHTML += `<th>${header}</th>`;
  });
  tableHTML += '</tr></thead><tbody>';
  
  data.forEach(row => {
    tableHTML += '<tr>';
    headers.forEach(header => {
      tableHTML += `<td>${row[header]}</td>`;
    });
    tableHTML += '</tr>';
  });
  
  tableHTML += '</tbody></table>';
  
  const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
