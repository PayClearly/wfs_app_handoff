// Third Party Imports ...


function utils_csvToJson(data, template) {
  return new Promise((resolve, reject) => {
    try {
      if (!data || Object.keys(data) < 1) {
        throw new Error('Must include data rows');
      }
    
      // Regex will skip separator characters that are inside double quotes
      const separatorRegex = new RegExp(',(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)', 'g');
    
      const rows = data.split('\n')
        .filter((row) => row)
        .map((row) => row.split(separatorRegex).map((field) => field.replace(/["']/g, '').trim()));

      const headerless = Object.keys(template).some(key => key.includes('COLUMN_'));

      const uploadedHeaders = rows[0];
      const uploadedRows = headerless ? rows : rows.slice(1);
    
      if (!uploadedRows.length) {
        throw new Error('You forgot to upload data! Please update your csv file and try again.');
      }
    
      const parsedRows = [];
      const errors = [];
    
      uploadedRows.forEach((row) => {
        const rowObject = {};
        uploadedHeaders.forEach((header, column) => {
          if (row[column]) {
            if (headerless) {
              rowObject[`COLUMN_${column + 1}`] = row[column];
            }

            /**
             * PC-4348 a csv file with a trailing comma in the header
             * row created an empty-string header. Add this check to
             * ignore columns without a proper header.
             */
            if (header) {
              rowObject[header] = row[column];
            }
          }
        });
        // rows validation
        parsedRows.push(rowObject);
      });
    
      if (errors.length > 0) {
        throw errors;
      }
    
      resolve({ parsedRows });
    } catch (err) {
      reject(err);
    }
  });
  // Helpers
}

export default utils_csvToJson;
