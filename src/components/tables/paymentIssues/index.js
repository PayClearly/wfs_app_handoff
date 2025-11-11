import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';
import Utils from 'utils';
import Selectors from 'selectors';
import Components from 'components';

import numeral from 'numeral';

import './index.scss';

const mapStateToProps = (state, props) => ({
  paymentIssues: Selectors.tableData.paymentIssues(state),
  filteredAndSortedItems: Selectors.tableItems('Components.tables.paymentIssues', props.tableKey, 'Selectors.tableData.paymentIssues(state)')(state),
});

const mapDispatchToProps = (dispatch, props) => ({});

const mapResourcesToProps = (state, props) => ({});

class components_tables_paymentIssues extends Component {

  state = {
    CODE_TO_MESSAGE: {
      1: 'Funds Remaining',
      2: 'Card refunded',
      3: 'Check returned',
      4: 'Auth expired',
      5: 'Ach debit failed',
    },
    columns: [
      {
        label: 'Type', dataKey: 'code', sortable: true, default: 'Unknown', cellRenderer: (data) => data,
      },
      {
        label: 'Amount', dataKey: 'amount', sortable: true, default: 'N/A', cellRenderer: (amount) => Utils.numeral()(amount).format('$0,0.00'),
      },
      {
        label: 'Payment Created', dataKey: 'paymentCreatedAt', sortable: true, cellRenderer: (data) => Utils.dates.dateToDay(data, 'dateFormatUS'),
      },
      {
        label: 'Resolved', dataKey: '_status', sortable: true, default: '', cellRenderer: (data) => <Components.badges.checkmark data={data === 'resolved'} />,
      },
      {
        label: 'Payment', dataKey: 'paymentId', sortable: true, sortKey: 'paymentRef', cellRenderer: (paymentId) => (paymentId ? <Components.chip refId={paymentId} /> : <span />),
      },
      {
        label: 'Transfer', dataKey: '_transferId', sortable: true, sortKey: 'transferRef', cellRenderer: (transferId) => (transferId ? <Components.chip refId={transferId} /> : <span />),
      },
      { label: 'Payment Ref', dataKey: 'paymentRefFormat', disableRender: true },
      { label: 'Transfer Ref', dataKey: 'transferRefFormat', disableRender: true },
    ],
  };





  rowRenderer = (rowId) => {
    const issue = this.props.paymentIssues[rowId];
    const status = issue._status === 'resolved' ? 'Resolved' : issue.code;
    const statusColor = issue._status === 'resolved' ? 'success' : 'danger';
    const icon = issue._status === 'resolved' ? 'check' : 'exclamation';
    const resolutionMessage = _resolvedCheck(issue);
    return (
      <div className="card card-body">
        <div className="card card-with-label">
          <p className="card-label px-1"><strong>Overview</strong></p>
          <div className="card-body">
            <div className="row">
              <div className="col-8">
                <div className="d-flex align-items-center mb-2">
                  <div className={`main-icon-container bg-${statusColor} d-flex justify-content-center align-items-center`}>
                    <i className={`mdi mdi-${icon} mdi-48px text-white`} />
                  </div>
                  <h1 className="mb-0 ms-3">{status}</h1>
                </div>
                <div className={`card card-body border-${statusColor} small-padding`}>
                  <h5>{'What\'s going on?'}</h5>
                  {this.props.paymentIssues[rowId]._resolvedAt
                    ? <p className="m-0">{resolutionMessage}</p>
                    : <Components.entities.paymentstatusissue
                      issueId={rowId}
                      hideTitle
                    />}
                </div>
              </div>
              <div className="col-4">
                <p className="text-muted mb-2">Amount: <strong>{numeral(issue.amount).format('$0,0.00')}</strong></p>
                {this.props.paymentIssues[rowId]._resolvedAt
                  ? <p className="text-muted mb-2">Resolved At: <strong>{Utils.dates.dateToDay(this.props.paymentIssues[rowId]._resolvedAt, 'dateFormatUS')}</strong></p>
                  : null}
                {this.props.paymentIssues[rowId]._resolvedAt
                  ? <p className="text-muted mb-2">Resolved By: <Components.badges.createdby user={this.props.paymentIssues[rowId]._resolvedBy} /></p>
                  : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { columns } = this.state;
    const { paymentIssues, filteredAndSortedItems } = this.props;
    return (
      <div className="components_tables_paymentIssues">
        <Components.tables.components.multiFilter
          tableName="Components.tables.paymentIssues"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig.multiFilter}
        />
        <Components.tables.components.collapsibleTable
          {...this.props}
          enableExport
          tableName="Components.tables.paymentIssues"
          tableKey={this.props.tableKey}
          data={{
            items: paymentIssues,
            count: _try(() => Object.keys(paymentIssues).length, 0),
          }}
          defaultTableState={{
            sort: {
              sortKey: 'paymentRef',
              orderIn: 'desc',
            },
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Issues"
          doNotExpand={this.props.doNotExpand}
          nestedTable={this.props.nestedTable}
          paginate
          initialRowsPerPage={this.props.nestedTable ? 10 : 25}
          hideRowsPerPageSelector={this.props.nestedTable}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_paymentIssues);


const filterConfig = {
  multiFilter: {
    status: {
      key: '_status',
      type: 'option',
      display: 'Status',
      options: {
        pending: { display: 'Pending' },
        resolved: { display: 'Resolved' },
      },
    },
    amount: {
      key: 'amount',
      type: 'number',
      display: 'Amount',
    },
    type: {
      key: 'code',
      type: 'option',
      display: 'Issue Type',
      options: {
        1: { display: 'Funds remaining' },
        2: { display: 'Card refunded' },
        3: { display: 'Check returned' },
        4: { display: 'Auth expired' },
        5: { display: 'Ach debit failed' },
      },
    },
    paymentRef: {
      key: 'paymentRefFormat',
      type: 'string',
      display: 'Payment Ref',
    },
    transferRef: {
      key: 'transferRefFormat',
      type: 'string',
      display: 'Transfer Ref',
    },
  },
  originalFilter: {},
};

const _resolvedCheck = ({
  amount, _resolvedAt, resolutionCode, _lastModifiedAt,
}) => {
  switch (resolutionCode) {
    case '1':
      return `Payment was refunded ${numeral(amount).format('$0,0.00')}${(_try(() => _resolvedAt) || _try(() => _lastModifiedAt)) ? ` on ${(new Date((_try(() => _resolvedAt) || _try(() => _lastModifiedAt))).toLocaleDateString())}` : ''}. Funds were sent back to your funding source via a withdrawal transfer.`;
    case '2':
      return `Payment was refunded ${numeral(amount).format('$0,0.00')}${(_try(() => _resolvedAt) || _try(() => _lastModifiedAt)) ? ` on ${(new Date((_try(() => _resolvedAt) || _try(() => _lastModifiedAt))).toLocaleDateString())}` : ''}. Funds were kept in your account, and made available for other payments.`;
    case '3':
      return `Payment was cancelled${(_try(() => _resolvedAt) || _try(() => _lastModifiedAt)) ? ` on ${(new Date((_try(() => _resolvedAt) || _try(() => _lastModifiedAt))).toLocaleDateString())}` : ''}`;
    default:
      return '';
  }
};
