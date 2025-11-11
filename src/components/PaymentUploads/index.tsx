import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import Button from '../button';
import TSTable, { Column } from '../tables/TSTable';
import {
  FTPFiles,
  NavigateData,
  AttachmentMetadata,
  FlattenedFTPFile,
  FlattenedFTPFiles,
} from './types';
import Tooltip from '../tooltip';
import { useSortableData } from '../tables/customHooks/useSortableData';

type Props = {
  data: FTPFiles;
  pendingIds: string[];
  processedIds: string[];
  archivedIds: string[];
  navigateToPayments: (data: NavigateData) => void;
  navigateToCsrDashboard: () => void;
  updatePaymentUpload: (id: string, status: 'pending' | 'processed' | 'archived' | 'held') => void;
  holdPayment: (id: string, status: 'pending' | 'processed' | 'archived' | 'held') => void;
  downloadAttachment: ({ attachment, forSFTP }: { attachment: AttachmentMetadata, forSFTP: boolean }) => void;
  fetchAttachment: ({ attachment, forSFTP }: { attachment: AttachmentMetadata, forSFTP: boolean }) => Promise<File>;
  bypassPaymentUploader: boolean;
  createPaymentsWithText: ({ textPayments, paymentUploadId, contentType }: { textPayments: string, paymentUploadId: string, contentType: string }) => Promise<unknown>;
  paymentStatusesStatus: { creating: boolean | undefined, creatingError: string | undefined, created: string | boolean | undefined }
}

function FileStatusBadge({
  status,
}: {
  status: 'pending' | 'processed' | 'archived' | 'held';
}) {
  const statusToColorClass = {
    processed: 'primary',
    held: 'warning',
    archived: 'secondary',
    pending: 'secondary',
  };

  // Assign appropriate class for the current status
  const colorClass = statusToColorClass[status] || 'secondary';

  return (
    <span className="text-primary">
      <div>
        <span
          style={{ fontSize: '70%' }}
          className={`badge rounded-pill bg-${colorClass}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </span>
  );
}

function PaymentUploads(props: Props) {
  const {
    data,
    navigateToPayments,
    navigateToCsrDashboard,
    updatePaymentUpload,
    downloadAttachment,
    fetchAttachment,
    holdPayment,
    bypassPaymentUploader,
    createPaymentsWithText,
    paymentStatusesStatus,
  } = props;
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [csvProcessingError, setCsvProcessingError] = useState<string>('');
  const [showSuccessNotification, setShowSuccessNotification] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setFileIds(Object.keys(data));
    if (paymentStatusesStatus.created) {
      setShowSuccessNotification(true);
    }
  }, [data, paymentStatusesStatus.created]);

  // Sorting
  const flattenedData: FlattenedFTPFiles = Object.entries(data).reduce(
    (acc, [key, file]) => {
      acc[key] = { ...file, fileName: file.attachment?.originalname || '' };
      return acc;
    },
    {} as FlattenedFTPFiles
  );
  const { sortedRowIds, requestSort, sortConfig } = useSortableData(
    flattenedData,
    fileIds,
    { direction: 'desc', key: '' }
  );

  // Pagination
  const itemsPerPage = 25;

  const [pageNumber, setPageNumber] = useState(0);

  const onPageChange = ({ selected }: { selected: number }) => {
    setPageNumber(selected);
  };

  const pagination = (
    <ReactPaginate
      previousLabel="prev"
      previousClassName="paginate_page previous"
      previousLinkClassName="paginate_button"
      nextLabel="next"
      nextClassName="paginate_page next"
      nextLinkClassName="paginate_button"
      breakLabel={<span className="ellipsis">...</span>}
      breakClassName="paginate_page"
      pageLinkClassName="paginate_button"
      pageClassName="paginate_page"
      containerClassName="paginatedTable_paginate p-0"
      activeClassName="current"
      marginPagesDisplayed={1}
      pageCount={Math.ceil(fileIds.length / itemsPerPage)}
      pageRangeDisplayed={2}
      onPageChange={onPageChange}
    />
  );

  const columns: Column<FlattenedFTPFile>[] = [
    {
      header: 'File Name',
      cellRenderer: (file) => (
        <Tooltip>
          <span>
            {file.fileName.length > 36
              ? `${file.fileName.slice(0, 33)}...`
              : file.fileName}
          </span>
          <span>{file.fileName}</span>
        </Tooltip>
      ),
      sortable: true,
      accessor: 'fileName',
    },
    {
      header: 'Uploaded At',
      cellRenderer: (file) => (
        <span>{new Date(file.uploadedAt).toLocaleString()}</span>
      ),
      sortable: true,
      accessor: 'uploadedAt',
    },
    {
      header: 'Submitted At',
      cellRenderer: (file) => (
        <span>
          {file._batchId ? new Date(file._batchId).toLocaleString() : '-'}
        </span>
      ),
      sortable: true,
      accessor: '_batchId',
    },
    {
      header: 'Status',
      cellRenderer: (file) => <FileStatusBadge status={file.status} />,
      sortable: true,
      accessor: 'status',
    },
    {
      header: 'Batch Id',
      accessor: '_batchId',
      sortable: true,
    },
    {
      header: '',
      cellRenderer: (file) => (
        <Button
          id="load-button"
          ariaLabel="Load Payments"
          className="btn btn-outline-primary submit-button me-1"
          disabled={file.status === 'processed' || paymentStatusesStatus.creating || loading}
          updating={paymentStatusesStatus.creating || loading}
          style={
            file.status !== 'pending'
              ? { display: 'none' }
              : { fontSize: '70%' }
          }
          buttonText={bypassPaymentUploader ? 'Create Payments' : 'Load'}
          onClick={() => {
            if (bypassPaymentUploader) {

              // Clear any previous errors and success notification
              setCsvProcessingError('');
              setShowSuccessNotification(false);
              setLoading(true);

              if (!file.attachment?.contentType?.toLowerCase().includes('text/csv')) {
                setCsvProcessingError('File not recognized as csv, unable to process request.');
                setLoading(false);
                return;
              }
              // Fetch the file from storage
              fetchAttachment({
                attachment: file.attachment,
                forSFTP: file.attachment.storagePath.includes('/uploads/'),
              })
                .then((fetchedFile) => fetchedFile.text())
                .then((csvContent) => createPaymentsWithText({ textPayments: csvContent, paymentUploadId: file._id, contentType: 'text/csv' }))
                .catch((error) => {
                  const errorMessage = error?.message || 'Failed to process CSV file. Please try again.';
                  setCsvProcessingError(errorMessage);
                })
                .finally(() => setLoading(false));
            } else {
              navigateToPayments({
                _id: file._id,
                forSFTP: file.attachment.storagePath.includes('/uploads/'),
              });
            }
          }}
        />
      ),
    },
    {
      header: '',
      cellRenderer: (file) => (
        <Button
          id="archive-button"
          buttonText={file.status === 'archived' ? 'Restore' : 'Archive'}
          ariaLabel={file.status === 'archived' ? 'Restore' : 'Archive'}
          onClick={() => updatePaymentUpload(file._id, file.status)}
          className="btn btn-outline-primary submit-button me-1"
          disabled={file.status === 'processed'}
          style={
            file.status === 'processed'
              ? { display: 'none' }
              : file.status === 'held'
                ? { display: 'none' }
                : { fontSize: '70%' }
          }
        />
      ),
    },
    {
      header: '',
      cellRenderer: (file) => (
        <Button
          buttonText="Download"
          id="download-button"
          onClick={() => downloadAttachment({
            attachment: file.attachment,
            forSFTP: file.attachment.storagePath.includes('/uploads/'),
          })}
          ariaLabel="Download attachment"
          className="btn btn-outline-primary submit-button me-1"
          style={{ fontSize: '70%' }}
        />
      ),
    },
    {
      header: '',
      cellRenderer: (file) => (
        <Button
          buttonText={file.status === 'held' ? 'Release' : 'Hold File'}
          id="download-button"
          onClick={() => holdPayment(file._id, file.status)}
          ariaLabel="Hold File"
          className="btn btn-outline-primary submit-button me-1"
          style={
            file.status === 'processed'
              ? { display: 'none' }
              : file.status === 'archived'
                ? { display: 'none' }
                : { fontSize: '70%' }
          }
        />
      ),
    },
  ];

  return (
    <div
      className="components_tables_components_collapsabletable"
      style={{ overflowX: 'scroll' }}
    >
      {(csvProcessingError || paymentStatusesStatus.creatingError) && (
        <div className="col-12">
          <div className="alert alert-danger" role="alert" style={{ whiteSpace: 'pre-line' }}>
            {csvProcessingError || paymentStatusesStatus.creatingError}
          </div>
        </div>
      )}
      {showSuccessNotification && (
        <div className="alert alert-primary mt-3 mb-3" role="alert">
          <div className="row align-items-center">
            <div className="col-xs-12 col-md-8 mt-1 mb-1">
              Payments successfully created! See details in payment history.
            </div>
            <div className="col-xs-12 col-md-4 mt-1 mb-1 text-center">
              <button
                type="button"
                className="btn btn-primary"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  navigateToCsrDashboard();
                }}
              >
                View Payment History
              </button>
            </div>
          </div>
        </div>
      )}
      <TSTable
        rowData={flattenedData}
        rowIds={sortedRowIds.slice(
          pageNumber * itemsPerPage,
          (pageNumber + 1) * itemsPerPage
        )}
        columns={columns}
        expandable={false}
        sortConfig={sortConfig}
        requestSort={requestSort}
      />
      {fileIds.length > itemsPerPage ? pagination : null}
    </div>
  );
}

export default PaymentUploads;
