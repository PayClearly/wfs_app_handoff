// Third Party Imports ...
import download from 'downloadjs';


function utils_exportCSVFile(fileName, items, headers) {
  if (headers) {
    items.unshift(headers);
  }

  // Convert Object to JSON
  const jsonObject = JSON.stringify(items);
  const csv = convertToCSV(jsonObject, Boolean(headers));

  const exportFilename = `${fileName}.csv` || 'export.csv';

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, exportFilename);
  } else {
    download(blob, exportFilename, 'text/csv');
  }
}

export default utils_exportCSVFile;

// Internal Helper Functions ... 
const convertToCSV = (objArray, hasHeaders) => {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = '';
  let headers;
  if (hasHeaders) {
    headers = array[0];
  }

  for (let i = 0; i < array.length; i += 1) {
    let line = '';
    if (i > 0 && hasHeaders) {
      Object.keys(headers).forEach((key) => {
        if (line !== '') line += ',';
        const value = getValue(array[i], key);
        line += value;
      });
    } else {
      Object.keys(array[i]).forEach((key) => {
        if (line !== '') line += ',';

        line += getValue(array[i], key);
      });
    }

    str += `${line}\r\n`;
  }

  return str;
};

const getValue = (item, key) => {
  let exportValue = '""';
  if (Object.prototype.hasOwnProperty.call(item, key)) {
    let value = item[key];
    switch (typeof value) {
      case 'string':
        break;
      case 'object':
        value = JSON.stringify(value);
        break;
      default:
        value = String(value);
        break;
    }
    // remove double quotes from within the value
    value = value.replace(/"/g, '');

    exportValue = `"${value}"`;
  }
  return exportValue;
};

