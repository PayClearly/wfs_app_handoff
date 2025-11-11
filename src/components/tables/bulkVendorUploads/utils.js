import UPLOAD_TEMPLATE from '../../modals/uploadvendors/constants';

/**
 * @param {import('../../../selectors/bulkVendorUploads').BulkVendorUploadRowItem} item 
 */
export function generateVendorErrorsFile(item) {
  const { rowErrors = [], issues = [] } = item;

  const extraHeaders = /** @type {const} */(['Output_File_Row_Number', 'Row_Error']);

  const headers = [...extraHeaders, ...UPLOAD_TEMPLATE];

  /**
   * @typedef {Record<typeof headers[number], string>} HeadersObject
   */

  /**
   * @type {HeadersObject}
   */
  const headersObjectInit = {};

  const emptyHeadersObject = headers.reduce((obj, header) => ({ ...obj, [header]: '' }), headersObjectInit);

  const rowErrorsRows = rowErrors.map((error, i) => {
    const data = error.message + error.stack;
    return [i, data].concat(UPLOAD_TEMPLATE.fill(''));
  });

  const rowNumberToHeadersObject = issues.reduce((acc, { row, issue }) => {
    const { message, path } = issue;

    if (!acc[row]) {
      acc[row] = {
        ...emptyHeadersObject,
        Output_File_Row_Number: row,
      };
    }

    if (!path) {
      return acc;
    }

    const field = path[0];

    acc[row][field] = message;

    return acc;
  }, {});

  const issuesRows = Object
    .values(rowNumberToHeadersObject)
    .map((obj) => Object.values(obj));

  const data = [headers, ...rowErrorsRows, ...issuesRows]
    .map((row) => row.join(','))
    .join('\n');

  return data;
}

export default generateVendorErrorsFile;
