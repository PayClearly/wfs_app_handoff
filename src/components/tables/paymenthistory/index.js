import {
  connect, Component,
} from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

// : Selectors.paymentHistoryTableData(state),
// : filteredAndSortedItemsSelector(state, {
//     });
//   };
// };
const mapStateToProps = (state, props) => ({
  paymentStatuses: Selectors.paymentHistoryTableData(state),
  filteredAndSortedItems: Selectors.tableItems(
    'Components.tables.paymenthistory',
    props.tableKey,
    'Selectors.paymentHistoryTableData(state)'
  )(state),
  paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item,
  organization: state.organization.data,
  featureFlags: Selectors.featureFlags(state),
});

const mapDispatchToProps = (dispatch) => ({
  markPaymentAsCancelled: (id, params) => {
    dispatch(Store.account.updatePaymentPipelines([id], 'cancelPayments', params));
  },
  openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
  openPaymentStatusVirtualCardsModal: (id) => {
    dispatch(Store.router.openModal('Components.modals.paymentstatusvirtualcards', { id }));
  },
});

class components_tables_paymenthistory extends Component {
  state = {
    columns: [
      {
        label: 'Status',
        dataKey: 'status',
        sortable: true,
        cellRenderer: (data, paymentStatusId, paymentStatus) => (
          <Components.badges.pipelineStatusNew data={paymentStatus} />
        ),
      },
      {
        label: '',
        dataKey: 'hasIssuesStatus',
        sortable: true,
        cellRenderer: (data, paymentStatusId, paymentStatus) => (
          <Components.badges.reversal data={{
            hasIssues: _try(() => paymentStatus.hasIssues),
            hasPendingIssues: _try(() => paymentStatus.hasPendingIssues),
          }}
          />
        ),
      },
      {
        label: 'Date',
        dataKey: 'createdTime',
        sortable: true,
        default: 'Unknown',
        cellRenderer: CreatedDate,
        exportFormatter: CreatedDate,
      },
      {
        label: 'Vendor',
        dataKey: 'vendorName',
        sortable: true,
        default: 'Unknown',
      },
      {
        label: 'Amount',
        dataKey: 'amount',
        sortable: true,
        default: 'Unknown',
        cellRenderer: FormatAmount,
        exportFormatter: FormatAmount,
      },
      {
        label: 'Method',
        dataKey: 'method',
        sortable: true,
        cellRenderer: (data) => <Components.badges.acceptsmethod data={data} />,
      },
      {
        label: 'Details',
        dataKey: 'details',
        sortable: true,
        cellRenderer: (data = '') => ((data.length > 40) ? `${data.slice(0, 40)}...` : data),
        disableExport: true,
      },
      {
        label: 'By',
        dataKey: '_createdBy',
        sortable: true,
        cellRenderer: (createdBy, _rowId, paymentStatus) => <Components.badges.createdby user={createdBy} default={paymentStatus.createdByApi ? 'API Key' : ''} />,
      },
      {
        label: 'Linked',
        dataKey: 'linked',
        sortable: true,
        cellRenderer: Linked,
        exportFormatter: (linked) => (linked ? 'True' : 'False'),
      },
      {
        label: 'Ref #',
        dataKey: '_ref',
        sortable: true,
        cellRenderer: (data, paymentStatusId, paymentStatus) => (paymentStatus._ref ? `P_${paymentStatus._ref}` : ''),
        exportFormatter: (ref) => (ref ? `P_${ref}` : null),
      },
      {
        label: '',
        dataKey: 'actionButton',
        sortable: false,
        cellRenderer: (data) => this.actionButtonRenderer(data),
      },
      {
        label: 'Submitted Date',
        dataKey: 'sentTime',
        sortable: false,
        default: '',
        exportFormatter: SubmittedDate,
        disableRender: true,
      },
    ],
  };

  componentDidMount() {
    const { columns } = this.state;

    // remember to order these from highest index to lowest, since we need to account for any iteration of
    // additional columns being spliced in
    if (_resolve(this, 'props.featureFlags.clients')) {
      columns.splice(4, 0, {
        label: 'Client',
        dataKey: 'clientDisplay',
        sortable: true,
        default: '-',
      });
    }

    if (this.props.paymentPipelinePreferences.enableCommissions) {
      columns.splice(2, 0, {
        label: '',
        dataKey: 'isCommission',
        sortable: true,
        cellRenderer: (data) => {
          if (!data) { return null; }
          return (
            <span style={{ fontSize: '28px' }} className="text-primary">
              <Components.tooltip className="float-start pe-2">
                <div><i className="mdi mdi-account-cash-outline" /></div>
                <div>Commission</div>
              </Components.tooltip>
            </span>
          );
        },
      });
    }

    this.setState(columns);
  }



  actionButtonRenderer = (data) => {
    const { onActionClick } = this.props;
    let showSendButton;
    const buttonColor = 'success';
    const buttonText = data.actionTitle;

    if (data.status === 'sending'
      && data.actionTitle
      && !data.isCancelled
      && (!data.vendorIsLinked || !data.automatable)
    ) {
      showSendButton = true;
    }

    return (
      <span>
        {
          showSendButton
          && <Components.button
            onClick={(e) => {
              e.stopPropagation();
              onActionClick(data.actionTitle, data.id);
            }}
            onDisabledDoubleClick={(e) => {
              e.stopPropagation();
              onActionClick(data.actionTitle, data.id);
            }}
            className={`btn btn-${buttonColor} do-not-expand`}
            type="button"
            aria-label="submit button"
            disabled={data.beingHandledBy}
            buttonText={buttonText}
          />
        }
      </span>);
  };

  /**
   *
   * @param {string} rowId
   * @param {*} rowData
   * @param {boolean} expanded
   * @returns
   */
  rowRenderer = (rowId) => (
    <Components.overviews.paymentstatus.view
      id={rowId}
    />
  );

  _generateActionContent = (rowData) => {
    const popoverContent = [];
    const id = rowData._id;

    if (_try(() => rowData.created.method === 'vCard') && _try(() => rowData.funded.vCards.length)) {
      popoverContent.push({
        title: 'View Virtual Cards',
        onClick: () => { this.props.openPaymentStatusVirtualCardsModal(id); },
        disabled: false,
      });
    }

    return popoverContent;
  };

  render() {
    const { paymentStatuses, filteredAndSortedItems, featureFlags } = this.props;

    return (
      <Components.tables.components.collapsibleTable
        tableName="Components.tables.paymenthistory"
        tableKey={this.props.tableKey}
        initialTableStateOverride={this.props.initialTableStateOverride}
        defaultTableState={{
          sort: {
            sortKey: '_ref',
            orderIn: 'desc',
          },
        }}
        data={{
          items: paymentStatuses,
          count: _try(() => Object.keys(paymentStatuses).length, 0),
        }}
        actions={!!(featureFlags && featureFlags.paymentsTableUpdateCards)}
        actionsInFirstColumn
        generateActionContent={this._generateActionContent}
        itemOrder={_try(() => filteredAndSortedItems, [])}
        columns={this.state.columns}
        rowRenderer={this.rowRenderer}
        typeForNoDataText="Payments"
        defaultSelectedRowId={this.props.newPaymentId || null}
        nestedTable={this.props.nestedInBatch}
        paginate
        initialRowsPerPage={!this.props.nestedInBatch ? 25 : 10}
        hideRowsPerPageSelector={this.props.nestedInBatch}
        enableExportCSV
        exportName="Payments"
        exportOptions={{ type: 'payment', includeCustomFields: true, includeLineItems: true }}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_paymenthistory);

// Internal Helper Functions ...
const CreatedDate = (at) => Utils.dates.dateToDay(at);
const SubmittedDate = (at) => {
  if (!at) { return ''; }
  return Utils.dates.dateToDay(at, 'dateSlashFormatUS');
};

function Linked(data) {
  return (
    <div className="d-flex flex-row">
      <span className="text-success">
        {data && <i className="mdi mdi-check" />}
      </span>
    </div>
  );
}

function FormatAmount(amount) {
  return (amount) ? numeral(amount).format('$0,0.00') : null;
}

