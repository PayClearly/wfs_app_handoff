import { connect, Component, Fragment } from 'component';
// Third Party Imports ...
import numeral from 'numeral';
import download from 'downloadjs';
import { Parser } from 'json2csv';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  paymentStatusesStatus: state.account.paymentStatuses.status,
  paymentStatuses: state.account.paymentStatuses.data.items,
  paymentStatusCollections: state.account.paymentStatuses.collections,
  batches: state.account.batchPayments.data.items,
  filteredAndSortedItems: Selectors.tableItems('Components.tables.batchhistory', props.tableKey, 'state.account.batchPayments.data.items')(state),
  integrations: Selectors.integrations(state),
  paymentPipelinePreferences: _try(() => state.account.paymentPipelinePreferences.data.item, {}),
  downloadTemplate: Selectors.paymentDownloadTemplate(state),
  accounts: state.accounts.data.items,
  organizationId: state.organization.data.id,
  accountId: state.account.data.id,
  processedJobs: state.jobs.generateOutputFile.data.items || {},
  processedJobsStatus: state.jobs.generateOutputFile.status,
  canRead: Selectors.entity('globalVendors_*')(state).canRead,
});

const mapDispatchToProps = (dispatch, props) => ({
  generateOutputFile: (batchId, filename) => dispatch(Store.jobs.create('generateOutputFile', batchId, filename)),
  downloadBPAM: (jobType, batchId) => dispatch(Store.jobs.create(jobType, batchId)),
  fetchPayments: (startId, endId) => dispatch(Store.account.fetchPaymentsWithIds(startId, endId)),
  downloadAttachment: (data) => dispatch(Store.jobs.downloadAttachment(data)),
  fetchGenerateOutputFileJobs: (data) => dispatch(Store.jobs.fetchGenerateOutputFileJobs(data)),
});

class components_overviews_csrPaymentBatch extends Component {
  state = {
    columns: [
      {
        label: 'Status', dataKey: 'status', sortable: true, cellRenderer: (data, batchId, batchData) => <Components.badges.pipelineStatusNew data={batchData} />,
      },
      {
        label: 'Date', dataKey: 'createdAt', sortable: true, default: 'Unknown', cellRenderer: CreatedDate, exportFormatter: CreatedDate,
      },
      {
        label: 'Payments', dataKey: 'paymentCount', sortable: true, default: 0, cellRenderer: (count) => count,
      },
      {
        label: 'Total', dataKey: 'total', sortable: true, default: '', cellRenderer: Total, exportFormatter: Total,
      },
      {
        label: 'Card', dataKey: 'vCardTotal', sortable: true, default: '', cellRenderer: Total, exportFormatter: Total,
      },
      {
        label: 'Check', dataKey: 'checkTotal', sortable: true, default: '', cellRenderer: Total, exportFormatter: Total,
      },
      {
        label: 'ACH', dataKey: 'ACHTotal', sortable: true, default: '', cellRenderer: Total, exportFormatter: Total,
      },
      {
        label: 'Batch Id', dataKey: '_id', sortable: true, default: '', cellRenderer: (id) => id,
      },
      {
        label: 'By', dataKey: 'createdBy', sortable: true, cellRenderer: (createdBy, batchId, batchData) => <Components.badges.createdby user={createdBy} default={batchData.createdByApi ? 'API Key' : ''} />,
      },
    ],
    bpamClicked: false,
    downloadClicked: false,
    batchIds: {},
  };

  componentDidMount() {
    this.props.fetchGenerateOutputFileJobs({ status: 'processed' });
  }

  componentWillReceiveProps(nextProps = {}) {
    if (this.props.processedJobsStatus.fetching && nextProps.processedJobsStatus.fetched) {
      const jobs = Object.values(nextProps.processedJobs[this.props.organizationId] && nextProps.processedJobs[this.props.organizationId][this.props.accountId] || {});
      jobs.forEach((job) => {
        if (this.state.batchIds[job.metadata._batchId]) {
          const attachmentData = {
            contentType: 'text/txt; charset=utf-8',
            originalname: this.state.batchIds[job.metadata._batchId],
            directory: 'attachments/batchAttachments',
            resourcePath: `paymentUploads/${this.props.organizationId}/${this.props.accountId}/`,
            storagePath: `${this.props.organizationId}/${this.props.accountId}/${job.metadata._batchId}/${job.metadata._batchId}_download_file.txt`,
          };

          this.setState({ downloadClicked: false, batchIds: {} });
          this.props.downloadAttachment(attachmentData);
        }
      });
    }
  }

  componentWillUnmount() { }

  _fetchPaymentsFromBatch = (paymentIds, batchId) => {
    let startIndex = 0;
    if (this.props.paymentStatusCollections.batch[batchId]) { startIndex = this.props.paymentStatusCollections.batch[batchId].length; }
    this.props.fetchPayments(paymentIds[startIndex], paymentIds[paymentIds.length - 1]);
  };

  rowRenderer = (rowId, rowData, expanded) => {
    const batchPaymentsFetched = Boolean(this.props.paymentStatusesStatus.fetched && this.props.paymentStatusCollections.batch[rowData._id] && this.props.paymentStatusCollections.batch[rowData._id].length === rowData.paymentCount);

    if (!this.props.paymentStatusesStatus.fetching && !batchPaymentsFetched) { this._fetchPaymentsFromBatch(Object.keys(rowData.paymentIds), rowData._id); }

    const isCancelled = rowData.status && rowData.status === 'Cancelled' || false;
    const isProcessing = rowData.status && rowData.status === 'Processing...' || false;
    const isSent = rowData.status && rowData.status === 'Tracking...' || false;
    const isTracked = rowData.status && rowData.status === 'Complete' || false;
    const isScheduled = (rowData.status && rowData.status === 'Scheduled');

    return (
      <div className="p-4" style={{ overflowX: 'hidden' }}>
        {rowData.paymentCount > 0
          && <div className="row">
            <div className="col-4">
              <div className="card">
                <div className="card-body">
                  {rowData.vCardCount > 0
                    && <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>{<span className="text-primary"><i className="mdi mdi-credit-card-outline pe-2" /></span>}<strong>{rowData.vCardCount}</strong> Card Payments:&nbsp;&nbsp;</span>
                      </div>
                      <div>
                        <strong>{numeral(rowData.vCardTotal).format('$0,0.00')}</strong>
                      </div>
                    </div>}
                  {rowData.checkCount > 0
                    && <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>{<span className="text-primary"><i className="mdi mdi-email-outline pe-2" /></span>}<strong>{rowData.checkCount}</strong> Check Payments:&nbsp;&nbsp;</span>
                      </div>
                      <div>
                        <strong>{numeral(rowData.checkTotal).format('$0,0.00')}</strong>
                      </div>
                    </div>}
                  {rowData.achCount > 0
                    && <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>{<span className="text-primary"><i className="mdi mdi-bank pe-2" /></span>}<strong>{rowData.achCount}</strong> ACH Payments:&nbsp;&nbsp;</span>
                      </div>
                      <div>
                        <strong>{numeral(rowData.ACHTotal).format('$0,0.00')}</strong>
                      </div>
                    </div>}
                  {rowData.commissionCount > 0
                    && <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>{<span className="text-primary"><i className="mdi mdi-account-cash-outline pe-2" /></span>}<strong>{rowData.commissionCount}</strong> Commission Payments:&nbsp;&nbsp;</span>
                      </div>
                      <div>
                        <strong>{numeral(rowData.commissionTotal).format('$0,0.00')}</strong>
                      </div>
                    </div>}
                  <hr className="my-1" />
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span>{<span className="text-primary"><i className="mdi mdi-currency-usd pe-2" /></span>}<strong>{rowData.paymentCount}</strong> Total Payments:&nbsp;&nbsp;</span>
                    </div>
                    <div>
                      <strong>{numeral(rowData.total).format('$0,0.00')}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              {isScheduled
                && <div className="row mb-2">
                  <Components.button
                    onClick={() => {
                      this.props.editBatch(this.props.paymentStatusCollections.batch[rowData._id], rowData.scheduled);
                    }}
                    className="btn btn-secondary me-2"
                    type="button"
                    aria-label="edit button"
                    disabled={this.props.paymentStatusesStatus.updating}
                    updating={this.props.paymentStatusesStatus.updating}
                    buttonText={'Update Schedule'}
                  />
                  <span style={{ 'font-size': '.8em' }} className="pt-2 text-muted">Scheduled for {Utils.dates.dateToDay(rowData.scheduled)}</span>
                </div>}
              {!isCancelled && !isTracked && this.props.cancelBatch && typeof this.props.cancelBatch === 'function'
                && <div className="row mb-2">
                  <Components.button
                    onClick={() => {
                      this.props.cancelBatch(this.props.paymentStatusCollections.batch[rowData._id]);
                    }}
                    className="btn btn-danger"
                    type="button"
                    aria-label="submit button"
                    disabled={this.props.paymentStatusesStatus.updating}
                    updating={this.props.paymentStatusesStatus.updating}
                    buttonText={'Cancel Batch'}
                  />
                </div>}
              {
                (this.props.paymentPipelinePreferences.downloadTemplate || this.props.integrations.erpIntegration.provider === 'ADVANTAGE')
                && <div className="row mb-2">
                  <Components.button
                    onClick={() => this.downloadCSV(rowData._id)}
                    className="btn btn-primary"
                    aria-label="export button"
                    disabled={false}
                    buttonText="Download CSV"
                  />
                </div>
              }
              {
                this.props.paymentPipelinePreferences.paymentUploadFileType === 'comdata'
                && <div className="row mb-2">
                  <Components.button
                    onClick={() => this.generateOutputFile(rowData._id, 'PS21', 'DAT')}
                    className="btn btn-primary"
                    aria-label="export button"
                    disabled={!(isProcessing || isSent || isTracked) || isCancelled}
                    buttonText="Download PS21"
                    updating={this.state.downloadClicked}
                  />
                </div>
              }
              {
                this.props.paymentPipelinePreferences.paymentUploadFileType === 'wexap3'
                && <div className="row mb-2">
                  <Components.button
                    onClick={() => this.generateOutputFile(rowData._id, 'APRETURN', 'DAT', rowData.createdAt)}
                    className="btn btn-primary"
                    aria-label="export button"
                    buttonText="Download APRETURN"
                    updating={this.state.downloadClicked}
                  />
                </div>
              }
              {
                this.props.paymentPipelinePreferences.paymentUploadFileType === 'csv' && this.props.integrations.cardsIntegration.provider === 'GALILEO'
                && <div className="row mb-2">
                  <Components.button
                    onClick={() => this.generateOutputFile(rowData._id, 'batchMatch', 'csv')}
                    className="btn btn-primary"
                    aria-label="export button"
                    disabled={!(isProcessing || isSent || isTracked) || isCancelled}
                    buttonText="Download Batch Match"
                    updating={this.state.downloadClicked}
                  />
                </div>
              }
              {
                this.props.paymentPipelinePreferences.paymentUploadFileType === 'bpam' && this.props.tableKey === 'csraccountdetails'
                && <div className="row mb-2">
                  <Components.button
                    onClick={() => this.downloadAttachmentBPAM('generateOutputFile', rowData._id)}
                    className="btn btn-primary"
                    aria-label="export button"
                    disabled={!(isTracked || isCancelled)}
                    buttonText="Submit BPAM To FTP"
                    updating={this.state.bpamClicked}
                  />
                </div>
              }
            </div>
          </div>}
        {
          !batchPaymentsFetched
            ? <Components.spinner />
            : <Components.tables.paymenthistory
              nestedInBatch
              tableKey={`${this.props.tableKey}-${rowId}`}
              onActionClick={this.props.onActionClick}
              initialTableStateOverride={{
                filters: {
                  _batchId: {
                    key: '_batchId', type: 'number', comparator: 'equals', value: rowData._id,
                  },
                },
              }}
            />
        }
      </div>
    );
  };

  downloadCSV = (batchId) => {
    const paymentIds = this.props.paymentStatusCollections.batch[batchId];
    const payments = paymentIds.map((id) => this.props.paymentStatuses[id]);
    const template = this.props.downloadTemplate;
    const data = payments.map((payment) => template(payment, this.props.canRead));
    const fields = this.props.paymentPipelinePreferences.downloadTemplate ? this.props.paymentPipelinePreferences.downloadTemplate.map((field) => field.fieldName) : ['Check Number', 'Check Amount', 'Vendor Name', 'Cleared Check Date'];
    const fieldsToParse = this.props.canRead ? [...fields, 'Notes'] : fields;
    const parser = new Parser({ fields: fieldsToParse });
    const csv = parser.parse(data);
    download(csv, `PC_${batchId}.csv`, 'text/csv');
  };

  downloadAttachmentBPAM = (jobType, batchId) => {
    // parseFloat on batchId because batchId is always a number - 05/19/21
    this.setState({ bpamClicked: true }, () => {
      setTimeout(() => this.setState({ bpamClicked: false }), 800);
    });
    return this.props.downloadBPAM(jobType, parseFloat(batchId));
  };

  generateOutputFile = (batchId, fileType, ext, batchTimestamp = null) => {
    const at = batchTimestamp || Date.now();
    const dateString = _createReturnFileDate(at, 'returnFile');
    const accountName = (this.props.accounts[this.props.accountId].name || '').replace(/\s/g, '');
    const filename = `${accountName}.${dateString}.${fileType}.${ext}`;

    this.setState((prev) => ({ downloadClicked: true, batchIds: { ...prev.batchIds, [batchId]: filename } }));

    // parseFloat on batchId because batchId is always a number - 05/20/21
    return this.props.generateOutputFile(parseFloat(batchId), filename);
  };

  render() {
    const { batches, filteredAndSortedItems } = this.props;

    return (
      <Components.tables.components.collapsibleTable
        tableName="Components.tables.batchhistory"
        tableKey={this.props.tableKey}
        initialTableStateOverride={this.props.initialTableStateOverride}
        defaultTableState={{
          sort: {
            sortKey: 'createdAt',
            orderIn: 'desc',
          },
        }}
        data={{
          items: batches,
          count: _try(() => Object.keys(batches).length, 0),
        }}
        itemOrder={_try(() => filteredAndSortedItems, [])}
        columns={this.state.columns}
        rowRenderer={this.rowRenderer}
        typeForNoDataText="Batches"
        nestedTable={this.props.nestedInFundingTable}
        paginate
        initialRowsPerPage={this.props.nestedInFundingTable ? 10 : 25}
        hideRowsPerPageSelector={this.props.nestedInFundingTable}
        iconOverride="mdi-cash-multiple"
        enableExportCSV
        exportName="Batch Payments"
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_csrPaymentBatch);

// Internal Helper Functions ...
const CreatedDate = (at) => Utils.dates.dateToDay(at);

const Total = (amount) => {
  if (amount > 0) {
    return numeral(amount).format('$0,0.00');
  }

  return '-';
};

function _createReturnFileDate(at, format) {
  return Utils.dates.dateToDay(at, format);
}
// GENERATOR_TYPE='component';
