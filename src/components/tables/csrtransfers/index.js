import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    canRead: Selectors.entity('achTransfers_idOrganization_idAccount')(state).canRead,
    canUpdate: Selectors.entity('achTransfers_*_*')(state).canUpdate,
    csrId: state.user.access.data.uid,
    canCreateOpsNotes: Selectors.entity('opsNotes_*_*')(state).canCreate,
    achAccount: state.account.achAccounts.data.items,
    achTransfersStatus: state.account.achTransfers.status,
    transfers: Selectors.tableData.csrtransfers(state),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.csrtransfers', props.tableKey, 'Selectors.tableData.csrtransfers(state)')(state),
    routeParams: state.router.route.params,
    featureFlags: Selectors.featureFlags(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openAchTransferMarkAsSentModal: (data) => {
      dispatch(Store.router.openModal('Components.modals.achtransfermarkassent', data));
    },
    openCompleteModal: (data) => {
      dispatch(Store.router.openModal('Components.modals.areyousure', data));
    },
    completeTransfer: (transferId, forcedCompleteBy) => {
      return dispatch(Store.account.updateAchTransferStatus(transferId, { status: 'complete', forcedCompleteBy }));
    },
    openOpsNotesModal: (data) => {
      return dispatch(Store.router.openModal('Components.modals.opsNotes', data));
    },
  });
};


class components_tables_csrtransfers extends Component {
  state = {
    columns: [
      { label: 'Status', dataKey: 'status', sortable: true, cellRenderer: (data) => { return <Components.badges.fundingtransferstatus status={data} />; }, exportFormatter: status => `${status.charAt(0).toUpperCase()}${status.slice(1)}` },
      { label: 'Date', dataKey: '_createdAt', sortable: true, default: 'Unknown', cellRenderer: (data, transferId, transfer) => Utils.dates.dateToDay(data), exportFormatter: Utils.dates.dateToDay },
      { label: 'Amount', dataKey: 'transferAmount', sortable: true, default: 'Unknown', cellRenderer: (data, transferId, transfer) => numeral(data).format('$0,0.00'), exportFormatter: amount => numeral(amount).format('$0,0.00') },
      { label: 'Note', dataKey: 'note', sortable: false, default: '-' },
    ],
  };

  componentDidMount() { }
  componentWillUnmount() {
    if (_try(() => this.props.routeParams.transferId)) {
      this.props.removeQueryParams(['transferId']);
    }
  }

  _generateActionContent = (transfer) => {
    const { featureFlags } = this.props;
    const { canUpdate, csrId, openCompleteModal, openAchTransferMarkAsSentModal, completeTransfer, canCreateOpsNotes, openOpsNotesModal } = this.props;
    if (!canUpdate) return [];

    const popoverContent = [];

    /**
     * Allow ops users to submit ACH debit transfers if the amount is negative,
     * even if 'enableOpsAchDebit' feature flag is disabled.
     * 
     * This is needed for submitting refunds.
     * 
     * This is client side validation for convenience and UI only, back end must do actual validation
     * of whether user is allowed to submit ACH debit transfers.
     */
    const isNegativeAmount = transfer.transferAmount < 0;

    if (transfer.status === 'pending' && !transfer._sentBy && (featureFlags?.enableOpsAchDebit || isNegativeAmount)) {
      popoverContent.push({
        title: 'Submit Transfer',
        onClick: () => {
          openAchTransferMarkAsSentModal({
            transferId: transfer.id,
            csrId,
          });
        },
        disabled: false,
      });
    }

    if (transfer.status === 'pending') {
      popoverContent.push({
        title: 'Force Complete',
        onClick: () => {
          openCompleteModal({
            title: 'Complete Funding Transfer',
            content: 'You are about to force complete this pending Transfer',
            noText: 'No',
            yesText: 'Yes',
            onYes: () => { completeTransfer(transfer.id, csrId); },
          });
        },
        disabled: false,
      });
    }
    if (canCreateOpsNotes) {
      popoverContent.push({
        title: 'Add/View Notes',
        onClick: () => {
          openOpsNotesModal({ achTransfer: transfer.id });
        },
      });
    }

    return popoverContent;
  }

  render() {
    const { transfers, filteredAndSortedItems, achTransfersStatus, canRead } = this.props;

    if (!achTransfersStatus.fetched) return null;
    if (!canRead) return <Components.invalidpermissions />;

    const selectedTransferId = _try(() => this.props.routeParams.transferId);

    return (
      <Fragment>
        <Components.tables.components.multiFilter
          tableName="Components.tables.csrtransfers"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig.multiFilter}
        />
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.csrtransfers"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            sort: {
              sortKey: '_createdAt',
              orderIn: 'desc',
              tieBreakKey: 'id',
            },
          }}
          data={{
            items: transfers,
            count: _try(() => Object.keys(transfers).length, 0),
          }}
          defaultSelectedRowId={selectedTransferId || null}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={this.state.columns}
          typeForNoDataText="Funding Transfers"
          doNotExpand
          actions
          actionsInFirstColumn
          generateActionContent={this._generateActionContent}
          paginate
          initialRowsPerPage={25}
          enableExportCSV
          exportName="Transfers"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_csrtransfers);

// Internal Helper Functions ... 
const filterConfig = {
  multiFilter: {
    transferAmount: {
      key: 'transferAmount',
      type: 'number',
      display: 'Amount',
    },
    _createdAtAfter: {
      key: '_createdAt',
      type: 'date',
      display: 'Date From',
      condition: 'isAfter',
    },
    _createdAtBefore: {
      key: '_createdAt',
      type: 'date',
      display: 'Date To',
      condition: 'isBefore',
    },
    status: {
      key: 'status',
      type: 'option',
      display: 'Status',
      options: {
        pending: { display: 'Pending' },
        processed: { display: 'Processed' },
        complete: { display: 'Complete' },
        cancelled: { display: 'Cancelled' },
      },
    },
    note: {
      key: 'note',
      type: 'string',
      display: 'Note',
    },
  },
  originalFilter: {
    status: {
      key: 'status',
      type: 'option',
      display: 'Status',
      options: {
        pending: { display: 'Pending' },
        processed: { display: 'Processed' },
        complete: { display: 'Complete' },
        cancelled: { display: 'Cancelled' },
      },
    },
    _createdAt: {
      key: '_createdAt',
      type: 'date',
      display: 'Date',
    },
    transferAmount: {
      key: 'transferAmount',
      type: 'number',
      display: 'Amount',
    },
    note: {
      key: 'note',
      type: 'string',
      display: 'Note',
    },
  },
};

// GENERATOR_TYPE='component';
