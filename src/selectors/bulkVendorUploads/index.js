import createSelector from 'selector';

/**
 * @typedef {object} ValidationIssue
 * @property {{ message: string, path?: string[] }} issue - Description of validation issue.
 * @property {string} row - The row the validation issue occurred in.
 */

/**
 * @typedef {object} BulkVendorUploadJobMetadata
 * @property {string} storagePath
 * @property {number} totalAttempted - Number of items in the original file
 * @property {number} totalCreated - The total number of created items.
 * @property {string} [outputFileStoragePath]
 * @property {string} [error] - If job errored unexpectedly, the error message.
 * @property {Error[]} [rowErrors] - Unexpected errors occurring while processing rows that are not validation errors.
 * @property {ValidationIssue[]} [issues] - Validation issues by row / column.
 */

/**
 * @typedef {object} BulkVendorUploadJob
 * @property {string} _id
 * @property {string} status
 * @property {string} createdAt
 * @property {string} statusByContext
 * @property {string} [lastError]
 * @property {BulkVendorUploadJobMetadata} metadata
 */

/**
 * @typedef {object} BulkVendorUploadRowItem
 * @property {string} organizationId
 * @property {string} accountId
 * @property {string} createdAt
 * @property {string} status
 * 
 * @property {string} fileName
 * @property {string} storagePath
 * @property {string} [outputFileStoragePath]
 * @property {string} [outputFileName]
 * 
 * @property {number} totalAttempted
 * @property {number} totalCreated
 * 
 * @property {string} jobId
 * @property {string} [jobError]
 * @property {Error[]} [rowErrors]
 * @property {ValidationIssue[]} [issues]
 */

/**
 * @param {BulkVendorUploadJob} job 
 * @returns {BulkVendorUploadRowItem}
 */
function adapter(job) {
  const {
    _id,
    createdAt,
    status,
    lastError,
    metadata,
    statusByContext,
  } = job;

  const [organizationId, accountId] = statusByContext.split(':');
  const fileName = metadata.storagePath.split('/').at(-1);
  const outputFileName = metadata.outputFilePath && metadata.outputFilePath.split('/').at(-1);

  return {
    organizationId,
    accountId,
    createdAt,
    status,

    totalAttempted: metadata.totalAttempted,
    totalCreated: metadata.totalCreated,

    fileName,
    storagePath: metadata.storagePath,
    outputFileName,
    outputFileStoragePath: metadata.outputFilePath,

    jobId: _id,
    jobError: lastError,
    rowErrors: metadata.rowErrors,
    issues: metadata.issues,
  };
}

const selector = createSelector(
  'selectors_bulkVendorUploads',
  (state) => state.jobs.bulkVendorUploads.data.items,
  (jobs) => Object.entries(jobs)
    .reduce((acc, [id, job]) => ({
      ...acc,
      [id]: adapter(job),
    }), {})
);

export default selector;
