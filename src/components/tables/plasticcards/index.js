import { connect, Component } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
    routeParams: state.router.route.params,
    cardPolicies: Selectors.entity('cards_idOrganization_idAccount')(state),
    plasticCards: _try(() => Selectors.plasticCardsTableData(state), {}),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.plasticcards', props.tableKey, 'Selectors.plasticCardsTableData(state)')(state),
    userRoles: state.user.roles.data.item,
    organizationId: state.organization.data.id,
    accountId: state.account.data.id,
    cardProvider: state.account.cardsIntegration.data.details.provider,
  });

const mapDispatchToProps = (dispatch, props) => ({
    cardsIntegrationUpdatePCard: (card) => {
      dispatch(Store.account.updateCardsIntegrationPCard(card));
    },
    openAreYouSureModal: (data) => dispatch(Store.router.openModal('Components.modals.areyousure', data)),
    openReissueModal: (id, plasticCard) => dispatch(Store.router.openModal('Components.modals.reissueplasticcard', { id, plasticCard })),
    removeQueryParams: (params = []) => {
      dispatch(Store.router.removeQueryParams(params));
    },
  });

class components_tables_plasticcards extends Component {

  state = {
    columns: [
      {
        label: 'Status', dataKey: 'status', sortable: true, default: 'Unknown', cellRenderer: (data) => <Components.badges.status data={_formatStatus(data)} />, exportFormatter: _formatStatus, 
      },
      {
        label: '', dataKey: 'issuingStatus', sortable: false, default: '', cellRenderer: _formatTooltip, exportFormatter: _formatTooltip, 
      },
      {
        label: 'Card', dataKey: 'cardLast4', sortable: true, default: 'Unknown', cellRenderer: _formatLastFour, exportFormatter: _formatLastFour, 
      },
      {
        label: 'Card Holder Name', dataKey: 'cardHolderName', sortable: true, default: '', 
      },
      {
        label: 'Memo', dataKey: 'cardMemo', sortable: true, default: '', 
      },
      {
        label: 'Valid Through', dataKey: 'expireDate', sortable: true, default: '', cellRenderer: _formatValidThrough, exportFormatter: _formatValidThrough, 
      },
      {
        label: '', dataKey: 'transactionInformation', sortable: false, cellRenderer: (transactionInformation) => <Components.misc.cardactivity data={transactionInformation} />, 
      },
      // { label: 'Created', dataKey: '_createdAt', sortable: true, default: 'Unknown', cellRenderer: _formatDate },
      // { label: 'By', dataKey: '_createdBy', sortable: true, cellRenderer: (data, plasticCardId, plasticCard) => <Components.badges.createdby user={data} /> },
    ],
  };

  componentDidMount() {}

  componentWillUnmount() {
    if (_try(() => this.props.routeParams.card)) {
      this.props.removeQueryParams(['card']);
    }
  }

  getActionContent = (plasticCard) => {
    const {
      id,
      status,
      issuingStatus = 'none',
      cardHolderName, cardLast4,
    } = plasticCard;
    const disabled = status === 'cancelled' || status === 'stolen' || status === 'lost' || !cardHolderName;

    const reissueCard = {
      title: 'Reissue Card',
      show: () => status === 'active' && issuingStatus === 'none',
      onClick: () => this.props.openReissueModal(id, plasticCard),
      disabled,
    };

    const activateCard = {
      title: 'Activate New Card',
      show: () => status === 'on_hold' && issuingStatus === 'shipped',
      onClick: () => {
        const data = { id, status: 'active' };
        this.props.openAreYouSureModal({
          title: `Activate Card ${_formatLastFour(cardLast4)}`,
          content: 'You are about to activate this plastic card.',
          noText: 'Cancel',
          yesText: 'Activate',
          yesButtonColor: 'primary',
          onYes: () => this.props.cardsIntegrationUpdatePCard(data),
        });
      },
      disabled,
    };

    const activateReissuedCard = {
      title: 'Activate Reissued Card',
      show: () => status === 'active' && issuingStatus === 'shipped',
      onClick: () => {
        const data = { id, issuingStatus: 'none' };
        this.props.openAreYouSureModal({
          title: `Activate Card ${_formatLastFour(cardLast4)}`,
          content: 'You are about to activate this reissued plastic card.',
          noText: 'No',
          yesText: 'Yes',
          yesButtonColor: 'primary',
          onYes: () => this.props.cardsIntegrationUpdatePCard(data),
        });
      },
      disabled,
    };

    const rootLevelRoles = this.props.userRoles.rootLevel || null;
    const orgLevelRoles = (this.props.userRoles.organizationLevel || {})[this.props.organizationId];
    const accountLevelRoles = ((this.props.userRoles.accountLevel || {})[this.props.organizationId] || {})[this.props.accountId];

    const activateBlockedCard = {
      title: 'Unblock Card',
      show: () => status === 'blocked'
        // Currently EFS is our only Plastic provider, restricted to that
        // TODO :: Update this when we add new providers
        && ['EFS', 'STUB'].some((provider) => provider === this.props.cardProvider)
        && (
          (rootLevelRoles && (rootLevelRoles.base_admin || rootLevelRoles.base_superAdmin))
          || (orgLevelRoles && orgLevelRoles.base_admin)
          || (orgLevelRoles && orgLevelRoles['wfs_myWorldCard:WFSAdministrator'])
          || (accountLevelRoles && accountLevelRoles.base_admin)
        ),
      onClick: () => {
        const data = { id, status: 'active' };
        this.props.openAreYouSureModal({
          title: `Unblock Card ${_formatLastFour(cardLast4)}`,
          content: 'You are about to unblock this plastic card. Cards are automatically blocked by your provider after a set amount of declines. This is to assist with fraud detection.',
          noText: 'Cancel',
          yesText: 'Unblock',
          yesButtonColor: 'primary',
          onYes: () => this.props.cardsIntegrationUpdatePCard(data),
        });
      },
      disabled,
    };

    const cancelCard = {
      title: 'Cancel Card',
      show: () => !disabled,
      onClick: () => {
        const data = { id, status: 'cancelled' };
        this.props.openAreYouSureModal({
          title: `Cancel Card ${_formatLastFour(cardLast4)}`,
          content: 'You are about to cancel this plastic card. This action is irreversible, and will render the card unusable in the future.',
          noText: 'No',
          yesText: 'Yes',
          onYes: () => this.props.cardsIntegrationUpdatePCard(data),
        });
      },
      disabled,
    };

    const stolenCard = {
      title: 'Card Stolen',
      show: () => !disabled,
      onClick: () => {
        const data = { id, status: 'stolen' };
        this.props.openAreYouSureModal({
          title: `Stolen Card ${_formatLastFour(cardLast4)}`,
          content: 'You are about to set the status of this plastic card to "Stolen". This action is irreversible, and will render the card unusable in the future.',
          noText: 'No',
          yesText: 'Yes',
          onYes: () => this.props.cardsIntegrationUpdatePCard(data),
        });
      },
      disabled,
    };

    const holdCard = {
      title: 'Place Hold On Card',
      show: () => !disabled && status !== 'on_hold',
      onClick: () => {
        const data = { id, status: 'on_hold' };
        this.props.openAreYouSureModal({
          title: `Place Hold On Card ${_formatLastFour(cardLast4)}`,
          content: 'You are about to place a hold on this card.',
          noText: 'No',
          yesText: 'Yes',
          yesButtonColor: 'primary',
          onYes: () => this.props.cardsIntegrationUpdatePCard(data),
        });
      },
      disabled,
    };

    const removeHoldFromCard = {
      title: 'Remove Hold From Card',
      show: () => status === 'on_hold' && issuingStatus === 'none',
      onClick: () => {
        const data = { id, status: 'active' };
        this.props.openAreYouSureModal({
          title: `Remove Hold From Card ${_formatLastFour(cardLast4)}`,
          content: 'You are about to remove the hold on this card.',
          noText: 'No',
          yesText: 'Yes',
          yesButtonColor: 'primary',
          onYes: () => this.props.cardsIntegrationUpdatePCard(data),
        });
      },
      disabled,
    };

    const actionContent = [reissueCard, activateCard, activateBlockedCard, activateReissuedCard, cancelCard, stolenCard, holdCard, removeHoldFromCard].filter((action) => action.show());

    return {
      ...plasticCard,
      actionContent: this.props.cardPolicies.canUpdate && actionContent || [],
    };
  };

  rowRenderer = (rowId, rowData, expanded) => <Components.entities.plasticcard plasticCard={rowData} id={rowId} />;

  render() {
    const { columns } = this.state;
    const { plasticCards = {}, filteredAndSortedItems } = this.props;
    const newPlasticCardId = this.props.routeParams.card;

    const data = {};
    Object.keys(plasticCards).forEach((plasticCardId) => {
      data[plasticCardId] = this.getActionContent(plasticCards[plasticCardId]);
    });

    return (
      <div className="components_tables_plasticcards">
        {!this.props.hideTitle && <h2 className="card-title mb-3">Plastic Cards</h2>}
        <Components.tables.components.multiFilter
          tableName="Components.tables.plasticcards"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig.multiFilter}
        />
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.plasticcards"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            sort: {
              sortKey: 'status',
              orderIn: 'asc',
            },
          }}
          data={{
            items: data,
            count: _try(() => Object.keys(data).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Cards"
          defaultSelectedRowId={newPlasticCardId || null}
          paginate
          initialRowsPerPage={25}
          actions
          enableExportCSV
          exportName="Plastic Cards"
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_plasticcards);

// Internal Helper Functions ...
const filterConfig = {
  multiFilter: {
    cardHolderName: {
      key: 'cardHolderName',
      type: 'string',
      display: 'Cardholder Name',
    },
    cardLast4: {
      key: 'cardLast4',
      type: 'string',
      display: 'Card Last 4',
    },
    status: {
      key: 'status',
      type: 'option',
      display: 'Status',
      options: {
        active: { display: 'Active' },
        on_hold: { display: 'On Hold' },
        cancelled: { display: 'Cancelled' },
        stolen: { display: 'Stolen' },
        // lost: { display: 'Lost' },
      },
    },
    issuingStatus: {
      key: 'issuingStatus',
      type: 'option',
      display: 'Issuing Status',
      options: {
        requested: { display: 'Requested' },
        new: { display: 'Processing' },
        shipped: { display: 'Shipped' },
        reissue: { display: 'Reissue' },
      },
    },
    memo: {
      key: 'memo',
      type: 'string',
      display: 'Memo',
    },
  },
  originalFilter: {
    activeOrOnHold: {
      key: 'activeOrOnHold',
      type: 'bool',
      display: 'Active / On Hold',
    },
    status: {
      key: 'status',
      type: 'option',
      display: 'Status',
      options: {
        active: { display: 'Active' },
        on_hold: { display: 'On Hold' },
        cancelled: { display: 'Cancelled' },
        stolen: { display: 'Stolen' },
        // lost: { display: 'Lost' },
      },
    },
    issuingStatus: {
      key: 'issuingStatus',
      type: 'option',
      display: 'Issuing Status',
      options: {
        requested: { display: 'Requested' },
        new: { display: 'Processing' },
        shipped: { display: 'Shipped' },
        reissue: { display: 'Reissue' },
      },
    },
    cardLast4: {
      key: 'cardLast4',
      type: 'string',
      display: 'Card # Last Four',
    },
    cardHolderName: {
      key: 'cardHolderName',
      type: 'string',
      display: 'Card Holder Name',
    },
    memo: {
      key: 'memo',
      type: 'string',
      display: 'Memo',
    },
  },
};

const _formatDate = (at) => Utils.dates.dateToDay(at);

const _formatValidThrough = (date) => {
  if (date === '0' || !date) { return ''; }
  return `${date.slice(4)}-${date.slice(0, 4)}`;
};

const _formatLastFour = (lastFour) => `*${numeral(lastFour).format('0000')}`;

const _formatStatus = (status) => `${status.split('_').reduce((acc, cur, index) => `${acc}${index > 0 ? ' ' : ''}${cur.charAt(0).toUpperCase()}${cur.slice(1)}`, '')}`;

const _formatTooltip = (issuingStatus) => {
  if (!issuingStatus) { return null; }
  return (
    <Components.tooltip className="d-inline">
      <span style={{ fontSize: '25px' }}><i className={`mdi mdi-${(issuingStatus === 'requested' && 'clock-outline' || issuingStatus === 'shipped' && 'email-outline')} align-middle`} /></span>
      <span>{issuingStatusMap[issuingStatus] || 'Processing...'}</span>
    </Components.tooltip>
  );
};

const issuingStatusMap = {
  new: 'Your new card is currently being processed.',
  shipped: 'Your card has been processed and is on its way.',
  reissue: 'Your reissued card is currently being processed.',
};

// GENERATOR_TYPE='component';
