import { connect, Component, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';
import download from 'downloadjs';
import { Parser } from 'json2csv';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import ReportsApi from 'api/reports';

import './index.scss';

const mapStateToProps = (state, props) => ({
  paymentStatusesStatus: state.account.paymentStatuses.status,
  paymentStatuses: state.account.paymentStatuses.data.items,
  paymentStatusCollections: state.account.paymentStatuses.collections,
  batches: !props.batchesToRender ? state.account.batchPayments.data.items : _getBatchesForFundingView(props.batchesToRender, state.account.batchPayments.data.items),
  filteredAndSortedItems: !props.batchesToRender ? Selectors.tableItems('Components.tables.batchhistory', props.tableKey, 'state.account.batchPayments.data.items')(state) : _getBatchItemsForFundingView(props.batchesToRender),
  isLinkedWithAdvantage: _try(() => Selectors.integrations(state).erpIntegration.provider) === 'ADVANTAGE',
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
  createPS21: (jobType, batchId, filename) => dispatch(Store.jobs.create(jobType, batchId, filename)),
  createAPRETURN: (jobType, batchId, filename) => dispatch(Store.jobs.create(jobType, batchId, filename)),
  downloadBPAM: (jobType, batchId) => dispatch(Store.jobs.create(jobType, batchId)),
  fetchPayments: (startId, endId) => dispatch(Store.account.fetchPaymentsWithIds(startId, endId)),
  downloadAttachment: (data) => dispatch(Store.jobs.downloadAttachment(data)),
  fetchGenerateOutputFileJobs: (data) => dispatch(Store.jobs.fetchGenerateOutputFileJobs(data)),
});

class components_overviews_paymentBatch extends Component {
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
        label: 'By', dataKey: 'createdBy', sortable: true, cellRenderer: (data, batchId, batchData) => <Components.badges.createdby user={data} default={batchData.createdByApi ? 'API Key' : ''} />,
      },
    ],
    bpamClicked: false,
    downloadClicked: false,
    downloadCsv: {},
    batchIds: {},
  };

  componentDidMount() {
    let { columns } = this.state;

    if (this.props.forFunding) {
      columns.push({
        label: '', dataKey: 'actionButton', sortable: false, cellRenderer: this._generateActionButton, headerRenderer: this._generateHeaderActionButton,
      });
    }

    if (this.props.batchesToRender) {
      columns = columns.map((column) => ({ ...column, sortable: false }));
    }

    this.setState({ columns });
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



  _generateActionButton = (data, rowId, rowData) => {
    let showSendButton = true;

    if (rowData.isCancelled) { showSendButton = false; }
    if (!rowData.needsFunding) { showSendButton = false; }
    return (
      <span>
        {
          showSendButton
          && <Components.submitBatchTransferButton
            paymentsForBatch={this.props.paymentStatusCollections.batch[rowData._id]}
            batchId={rowData._id}
          />
        }
      </span>);
  };

  _generateHeaderActionButton = () => {
    if (!_try(() => Object.keys(this.props.batches).length > 1)) { return null; }

    return <Components.submitBatchTransferButton />;
  };

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
                (this.props.paymentPipelinePreferences.downloadTemplate || this.props.isLinkedWithAdvantage)
                && <div className="row mb-2">
                  <Components.button
                    onClick={() => this.downloadCSV(rowData._id)}
                    className="btn btn-primary"
                    aria-label="export button"
                    disabled={false}
                    buttonText="Download CSV"
                    updating={this.state.downloadCsv[rowData._id] && this.state.downloadCsv[rowData._id].clicked}
                  />
                  {
                    this.state.downloadCsv[rowData._id] && this.state.downloadCsv[rowData._id].error
                    && (
                      <div className="d-flex download-csv-alert alert alert-danger" role="alert">
                        {this.state.downloadCsv[rowData._id].error.message}
                      </div>
                    )
                  }
                </div>
              }
              {
                this.props.paymentPipelinePreferences.paymentUploadFileType === 'comdata'
                && <div className="row mb-2">
                  <Components.button
                    onClick={() => this.downloadAttachmentPS21('generateOutputFile', rowData._id)}
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
                    onClick={() => this.downloadAttachmentAP('generateOutputFile', rowData._id, rowData.createdAt)}
                    className="btn btn-primary"
                    aria-label="export button"
                    buttonText="Download APRETURN"
                    updating={this.state.downloadClicked}
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
              tableKey={`${this.props.tableKey}-${rowData._id}`}
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

  downloadCSV = async (batchId) => {
    this.setState((prev) => ({
      ...prev,
      downloadCsv: {
        ...prev.downloadCsv,
        [batchId]: {
          clicked: true,
          error: null,
        },
      },
    }));

    await ReportsApi
      .getBatchReport(this.props.organizationId, this.props.accountId, batchId)
      .then((res) => {
        download(res.data, `PC_${batchId}.csv`, 'text/csv');

        this.setState((prev) => ({
          ...prev,
          downloadCsv: {
            ...prev.downloadCsv,
            [batchId]: {
              clicked: false,
            },
          },
        }));
      })
      .catch((err) => {
        this.setState((prev) => ({
          ...prev,
          downloadCsv: {
            ...prev.downloadCsv,
            [batchId]: {
              clicked: false,
              error: err,
            },
          },
        }));
      });
  };

  downloadAttachmentPS21 = (jobType, batchId) => {
    const dateString = _createReturnFileDate(Date.now(), 'returnFile');
    const accountName = (this.props.accounts[this.props.accountId].name || '').replace(/\s/g, '');
    const filename = `${accountName}.${dateString}.PS21.DAT`;

    this.setState((prev) => ({ downloadClicked: true, batchIds: { ...prev.batchIds, [batchId]: filename } }));

    // parseFloat on batchId because batchId is always a number - 05/20/21
    return this.props.createPS21(jobType, parseFloat(batchId), filename);
  };

  downloadAttachmentBPAM = (jobType, batchId) =>
    // parseFloat on batchId because batchId is always a number - 05/19/21
    this.props.downloadBPAM(jobType, parseFloat(batchId));

  downloadAttachmentAP = (jobType, batchId, batchTimestamp) => {
    const at = batchTimestamp || Date.now();
    const dateString = _createReturnFileDate(at, 'returnFile');
    const accountName = (this.props.accounts[this.props.accountId].name || '').replace(/\s/g, '');
    const filename = `${accountName}.${dateString}.APRETURN.DAT`;


    this.setState((prev) => ({ downloadClicked: true, batchIds: { ...prev.batchIds, [batchId]: filename } }));

    // parseFloat on batchId because batchId is always a number - 05/20/21
    return this.props.createAPRETURN(jobType, parseFloat(batchId), filename);
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

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_paymentBatch);

// Internal Helper Functions ...

const _getBatchesForFundingView = (batchIds = [], data = {}) => batchIds.reduce((acc, batchId) => {
  acc[batchId] = data[batchId];
  return acc;
}, {});

const _getBatchItemsForFundingView = (batchIds = []) => batchIds;

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
