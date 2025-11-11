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
    paymentStatusesStatus: state.account.paymentStatuses.status,
    canUpdate: Selectors.entity('achTransfers_*_*')(state).canUpdate,
    pendingResolvedIssues: _try(() => Selectors.funding(state).pendingResolvedIssues, {}),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.resolvedIssues', props.tableKey, 'Selectors.funding(state).pendingResolvedIssues')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openSubmitQueuedResolvedIssues: (data) => { dispatch(Store.router.openModal('Components.modals.submitQueuedResolvedIssues', data)); },
  });
};

class components_tables_resolvedIssues extends Component {
  state = {
    columns: [
      { label: 'Amount', dataKey: 'amount', sortable: true, cellRenderer: FormatAmount, exportFormatter: FormatAmount },
      { label: 'Date', dataKey: '_resolvedAt', sortable: true, cellRenderer: (data) => { return Utils.dates.dateToDay(data); }, exportFormatter: Utils.dates.dateToDay },
      { label: 'By', dataKey: '_resolvedBy', sortable: true, cellRenderer: (data) => { return <Components.badges.createdby user={data} />; } },
      { label: 'Payment Tag', dataKey: 'paymentId', sortable: true, cellRenderer: paymentId => (paymentId ? <Components.chip refId={paymentId} /> : <span />) },
    ],
  };

  componentDidMount() {}
  componentWillUnmount() {}

  _generateActionContent = (resolvedIssue) => {
    const { canUpdate, forCSR } = this.props;
    if (!canUpdate || !forCSR) return [];

    const popoverContent = [];

    popoverContent.push({
        title: 'Submit for Withdrawal',
        onClick: () => {
          this.props.openSubmitQueuedResolvedIssues({
            pendingResolvedIssueIds: [resolvedIssue.id],
          });
        },
        disabled: false,
    });

    return popoverContent;
  }

  render() {
    const { pendingResolvedIssues, filteredAndSortedItems, paymentStatusesStatus } = this.props;
    if (!_try(() => paymentStatusesStatus.fetched)) return <Components.spinner />;

    return (
      <Fragment>
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.resolvedIssues"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            sort: {
              sortKey: '_resolvedAt',
              orderIn: 'desc',
            },
          }}
          data={{
            items: pendingResolvedIssues,
            count: _try(() => Object.keys(pendingResolvedIssues).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={this.state.columns}
          typeForNoDataText="Pending Withdrawals"
          doNotExpand
          actions={this.props.forCSR}
          actionsInFirstColumn={this.props.forCSR}
          generateActionContent={this.props.forCSR && this._generateActionContent}
          paginate
          initialRowsPerPage={25}
          enableExportCSV
          exportName="Withdrawal Overrides"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_resolvedIssues);

// Internal Helper Functions ... 

const FormatAmount = (amount) => {
  return (amount) ? numeral(amount).format('$0,0.00') : null;
};

// GENERATOR_TYPE='component';
