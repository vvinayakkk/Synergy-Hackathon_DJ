export const downloadCSV = (data, filename) => {
  const headers = ['ID', 'Company Name', 'Price', 'Change', 'Rating', 'Sector', 'Industry'];
  const csvContent = [
    headers.join(','),
    ...data.map(stock => [
      stock.id,
      `"${stock.name}"`,
      stock.price,
      stock.change,
      stock.rating,
      `"${stock.sector}"`,
      `"${stock.industry}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const saveToJSON = (data, filename) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
