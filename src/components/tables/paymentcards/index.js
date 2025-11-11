import {
  connect, Component, Fragment,
} from 'component';

// Third-party imports ...

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  paymentCardCustomFields: state.account.paymentCardCustomFields.data.item,
  paymentCardsStatus: state.account.paymentCards.status,
  routeParams: state.router.route.params,
  cardsIntegrationStatus: _try(() => state.account.cardsIntegration.status, {}),
  paymentCards: _try(() => Selectors.paymentCardsTableData(state), {}),
  filteredAndSortedItems: Selectors.tableItems(
    'Components.tables.paymentcards',
    props.tableKey,
    'Selectors.paymentCardsTableData(state)'
  )(state),
});

const mapDispatchToProps = (dispatch) => ({
  openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
  cancelPaymentCards: (data) => dispatch(Store.account.updatePaymentCard(data, 'cancel')),
  removeQueryParams: (params = []) => {
    dispatch(Store.router.removeQueryParams(params));
  },
});

const filterConfig = {
  multiFilter: {
    name: {
      key: 'name',
      type: 'string',
      display: 'Name',
    },
    lastFour: {
      key: 'lastFour',
      type: 'string',
      display: 'Card Last 4',
    },
    status: {
      key: 'status',
      type: 'option',
      display: 'Status',
      options: {
        active: { display: 'Active' },
        pending: { display: 'Pending' },
        on_hold: { display: 'On Hold' },
        cancelled: { display: 'Cancelled' },
      },
    },
    _createdAtAfter: {
      key: '_createdAt',
      type: 'date',
      display: 'Date Created From',
      condition: 'isAfter',
    },
    _createdAtBefore: {
      key: '_createdAt',
      type: 'date',
      display: 'Date Created To',
      condition: 'isBefore',
    },
    totalBilled: {
      key: 'totalBilled',
      type: 'number',
      display: 'Total Billed',
    },
    totalCleared: {
      key: 'totalCleared',
      type: 'number',
      display: 'Total Cleared',
    },
    remainingBalance: {
      key: 'remainingBalance',
      type: 'number',
      display: 'Amount Remaining',
    },
    paymentCardRef: {
      key: 'paymentCardRef',
      type: 'number',
      display: 'Ref #',
    },
  },
  originalFilter: {
    isActive: {
      key: 'isActive',
      type: 'bool',
      display: 'Active',
    },
    status: {
      key: 'status',
      type: 'option',
      display: 'Status',
      options: {
        active: { display: 'Active' },
        pending: { display: 'Pending' },
        on_hold: { display: 'On Hold' },
        cancelled: { display: 'Cancelled' },
      },
    },
    _createdAt: {
      key: '_createdAt',
      type: 'date',
      display: 'Created Date',
    },
    name: {
      key: 'name',
      type: 'string',
      display: 'Name',
    },
    totalBilled: {
      key: 'totalBilled',
      type: 'number',
      display: 'Total Billed',
    },
    totalCleared: {
      key: 'totalCleared',
      type: 'number',
      display: 'Total Cleared',
    },
    remainingBalance: {
      key: 'remainingBalance',
      type: 'number',
      display: 'Remaining',
    },
    lastUsed: {
      key: 'lastUsed',
      type: 'date',
      display: 'Last Used',
    },
    lastFour: {
      key: 'lastFour',
      type: 'string',
      display: 'Card # Last Four',
    },
    paymentCardRef: {
      key: 'paymentCardRef',
      type: 'number',
      display: 'Ref #',
    },
  },
};

const statusBadge = (data) => (data === 'active'
  ? (
    <span className="badge rounded-pill bg-primary">
      {`${data.charAt(0).toUpperCase()}${data.slice(1)}`}
    </span>
  )
  : (
    <span className="badge rounded-pill bg-secondary">
      {(data && data.split('_').reduce((acc, cur, index) => `${acc}${index > 0
        ? ' '
        : ''}${cur.charAt(0).toUpperCase()}${cur.slice(1)}`, '')) || 'Unknown'}
    </span>
  )
);

const formatRef = (refNumber) => ((refNumber) ? `C_${refNumber}` : null);

const formatDate = (date) => Utils.dates.dateToDay(date || Date.now());

const formatUsedDate = (date) => (date ? Utils.dates.dateToDay(date || Date.now()) : 'Never');

const formatMoneyAmount = (amount) => Utils.numeral()(amount).format('$0,0.00');

const formatLastFour = (lastFour) => `*${lastFour}`;

const _getColumns = (columnObj) => {
  const customFieldColumns = Object.keys(columnObj).map((fieldName) => ({
    label: fieldName, dataKey: fieldName, sortable: true, default: '',
  }));
  const columns = [
    {
      label: 'Status',
      dataKey: 'status',
      sortable: true,
      cellRenderer: statusBadge,
      exportFormatter: (status) => status[0].toUpperCase() + status.slice(1),
    },
    {
      label: 'Created',
      dataKey: '_createdAt',
      sortable: true,
      default: 'Unknown',
      cellRenderer: formatDate,
      exportFormatter: formatDate,
    },
    {
      label: 'Name',
      dataKey: 'name',
      sortable: true,
      default: 'Unknown',
    },
    {
      label: 'Total Billed',
      dataKey: 'totalBilled',
      sortable: true,
      default: '-',
      cellRenderer: formatMoneyAmount,
      exportFormatter: formatMoneyAmount,
    },
    {
      label: 'Total Cleared',
      dataKey: 'totalCleared',
      sortable: true,
      default: '-',
      cellRenderer: formatMoneyAmount,
      exportFormatter: formatMoneyAmount,
    },
    {
      label: 'Remaining',
      dataKey: 'remainingBalance',
      sortable: true,
      default: '-',
      cellRenderer: formatMoneyAmount,
      exportFormatter: formatMoneyAmount,
    },
    {
      label: 'Last Used',
      dataKey: 'lastUsed',
      sortable: true,
      default: '',
      cellRenderer: formatUsedDate,
      exportFormatter: formatUsedDate,
    },
    {
      label: 'Card',
      dataKey: 'lastFour',
      sortable: true,
      default: '***',
      cellRenderer: formatLastFour,
      exportFormatter: formatLastFour,
    },
    {
      label: 'By',
      dataKey: '_createdBy',
      sortable: true,
      cellRenderer: (data) => <Components.badges.createdby user={data} />,
    },
    {
      label: 'Ref #',
      dataKey: 'paymentCardRef',
      sortable: true,
      cellRenderer: formatRef,
      exportFormatter: formatRef,
    },
    ...customFieldColumns,
    {
      label: '',
      dataKey: 'transactionInformation',
      sortable: false,
      cellRenderer: (transactionInformation) => <Components.misc.cardactivity data={transactionInformation} />,
    },
  ];
  return columns;
};

const _getFilterConfig = (customFields, multiFilter) => {
  const customFieldConfig = Object.keys(customFields).reduce((acc, fieldName) => {
    acc[fieldName] = {
      key: fieldName,
      type: 'string',
      display: fieldName,
    };
    return acc;
  }, {});

  const filterConfigToCopy = multiFilter ? filterConfig.multiFilter : filterConfig.originalFilter;

  return { ...filterConfigToCopy, ...customFieldConfig };
};

// eslint-disable-next-line camelcase
class components_tables_paymentcards extends Component {
  state = {
    columns: [],
  };

  componentDidMount() {
    const columns = _getColumns(this.props.paymentCardCustomFields);

    this.setState({ columns });
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.paymentCardCustomFields) !== JSON.stringify(this.props.paymentCardCustomFields)) {
      const columns = _getColumns(nextProps.paymentCardCustomFields);
      this.setState({ columns });
    }
  }

  componentWillUnmount() {
    if (_try(() => this.props.routeParams.card)) {
      this.props.removeQueryParams(['card']);
    }
  }

  handleCancel = (paymentCardIds) => {
    const paymentCardIdsSize = Object.keys(paymentCardIds).length;
    this.props.openAreYouSureModal({
      title: `Cancel ${paymentCardIdsSize} purchase card${paymentCardIdsSize > 1 ? 's' : ''}`,
      content: `You are about to cancel ${paymentCardIdsSize} purchase card${paymentCardIdsSize > 1 ? 's' : ''}. `
        + `${paymentCardIdsSize > 1 ? 'These cards' : 'This card'} `
        + `cannot be reactivated once cancelled. Are you sure you wish to proceed?`,
      noText: 'Cancel',
      yesText: 'Continue',
      yesButtonColor: 'primary',
      onYes: () => {
        const ids = paymentCardIds.map((id) => ({ id }));
        this.props.cancelPaymentCards(ids);
      },
    });
  };

  rowRenderer = (rowId) => (
    <Components.entities.paymentcard id={rowId} />
  );

  render() {
    const { columns } = this.state;
    const { filteredAndSortedItems, paymentCards = {} } = this.props;
    if (!_try(() => this.props.paymentCardsStatus.fetched) || !_try(() => this.props.cardsIntegrationStatus.fetched)) {
      return <Components.spinner />;
    }
    const newPaymentCardId = this.props.routeParams.card;

    return (
      <Fragment>
        {!this.props.hideTitle && <h2 className="card-title mb-3">Purchase Cards</h2>}
        <Components.tables.components.multiFilter
          tableName="Components.tables.paymentcards"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={_getFilterConfig(this.props.paymentCardCustomFields, true)}
        />
        <Components.tables.components.updateableTable
          columns={columns}
          updateActions={[{
            title: 'Cancel Cards',
            onClick: (ids) => this.handleCancel(ids),
          }]}
        >
          <Components.tables.components.collapsibleTable
            tableName="Components.tables.paymentcards"
            tableKey={this.props.tableKey}
            initialTableStateOverride={this.props.initialTableStateOverride}
            defaultTableState={{
              sort: {
                sortKey: 'paymentCardRef',
                orderIn: 'desc',
              },
              filters: {
                status: {
                  key: 'status', type: 'option', comparator: 'is', value: 'active',
                },
              },
            }}
            data={{
              items: paymentCards,
              count: _try(() => Object.keys(paymentCards).length, 0),
            }}
            itemOrder={_try(() => filteredAndSortedItems, [])}
            columns={columns}
            rowRenderer={this.rowRenderer}
            typeForNoDataText="Cards"
            defaultSelectedRowId={newPaymentCardId || null}
            paginate
            initialRowsPerPage={25}
            enableExportCSV
            exportName="Payment Cards"
          />
        </Components.tables.components.updateableTable>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_paymentcards);
