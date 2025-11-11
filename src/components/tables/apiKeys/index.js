import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import { Collapse } from 'react-collapse';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    account: state.account.data,
    organization: state.organization.data,
    status: state.apiKeys.status,
    apiKeyPolicies: Selectors.entity('apiKeys_idOrganization_idAccount')(state),
    apiKeys: _try(() => state.apiKeys.data.items[state.organization.data.id][state.account.data.id], {}),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.apiKeys', props.tableKey, `state.apiKeys.data.items.${state.organization.data.id}.${state.account.data.id}`)(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateApiKey: (organizationId, accountId, apiKeyId, data) => {
      dispatch(Store.apikeys.update(organizationId, accountId, apiKeyId, data));
    },
    openAreYouSureModal: (data) => {
      dispatch(Store.router.openModal('Components.modals.areyousure', data));
    },
    clearErrors: () => {
      dispatch(Store.apikeys.clearErrors());
    },
  });
};


class components_tables_apiKeys extends Component {
  state = {
    columns: [],
  }

  componentDidMount() {
    const columns = [
      { label: 'Status', dataKey: 'status', sortable: true, cellRenderer: data => <Components.badges.status data={data} color="danger" /> },
      { label: 'Created', dataKey: 'createdAt', sortable: true, cellRenderer: this.CreatedDate },
      { label: 'Description', dataKey: 'description', sortable: true },
    ];

    if (this.props.apiKeyPolicies.canUpdate) {
      columns.push({ label: '', dataKey: 'id', cellRenderer: this.RevokeButton });
    }

    this.setState({ columns });
  }

  componentWillUnmount() {
    this.props.clearErrors();
  }

  CreatedDate = (data) => {
    return Utils.dates.dateToDay(data, 'dayAndTime');
  };

  RevokeButton = (id, apiKeyId, apiKey) => {
    if (!this.props.apiKeyPolicies.canUpdate || apiKey.status === 'revoked') return null;

    const updating = this.props.status.updating || this.props.status.creating;

    return (
      <div style={{ width: '70px' }}>
        <Components.button
          onClick={() => this.handleRevokeWarning(id)}
          buttonText="Revoke"
          className="btn btn-danger btn-sm do-not-expand w-100"
          disabled={updating}
          updating={updating && id === this.state.apiKeyRevoked}
        />
      </div>
    );
  };

  handleRevoke = (apiKeyId) => {
    const { account, organization } = this.props;
    const accountId = account.id;
    const organizationId = organization.id;

    this.props.clearErrors();
    this.setState({ apiKeyRevoked: apiKeyId });
    return this.props.updateApiKey(organizationId, accountId, apiKeyId, { status: 'revoked' });
  }

  handleRevokeWarning = (apiKeyId) => {
    return this.props.openAreYouSureModal({
      title: 'Revoke API Key',
      content: 'Revoking an API key will permanently disable it.\nThis action is not undoable.',
      noText: 'Cancel',
      yesText: 'Revoke',
      onYes: () => { return this.handleRevoke(apiKeyId); },
    });
  }

  render() {
    const { apiKeys, filteredAndSortedItems } = this.props;
    if (!this.props.apiKeyPolicies.canRead) return <Components.invalidpermissions />;
    const { updatingError } = this.props.status;

    return (
      <Fragment>
        <Components.tables.components.multiFilter 
          tableName="Components.tables.apiKeys"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig.multiFilter}
        />
        <Collapse isOpened={updatingError}>
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            Error: {updatingError}
          </div>
        </Collapse>
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.apiKeys"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            filters: {
              status: { key: 'status', type: 'option', comparator: 'is', value: 'active' },
            },
            sort: {
              sortKey: 'createdAt',
              orderIn: 'desc',
            },
          }}
          data={{
            items: apiKeys,
            count: _try(() => Object.keys(apiKeys).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={this.state.columns}
          typeForNoDataText="API Keys"
          doNotExpand
          iconOverride="mdi-key"
          paginate
          initialRowsPerPage={10}
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_apiKeys);

// Internal Helper Functions ...
const filterConfig = {
  multiFilter: {
    status: {
      key: 'status',
      type: 'option',
      display: 'Status',
      options: {
        active: { display: 'Active' },
        revoked: { display: 'Revoked' },
      },
    },
    createdAtAfter: {
      key: 'createdAt',
      type: 'date',
      display: 'Created From',
      condition: 'isAfter',
    },
    createdAtBefore: {
      key: 'createdAt',
      type: 'date',
      display: 'Created To',
      condition: 'isBefore',
    },
    description: {
      key: 'description',
      type: 'string',
      display: 'Description',
    },
  },
  originalFilter: {
    status: {
      key: 'status',
      type: 'option',
      display: 'Status',
      options: {
        active: { display: 'Active' },
        revoked: { display: 'Revoked' },
      },
    },
    createdAt: {
      key: 'createdAt',
      type: 'date',
      display: 'Created',
    },
    description: {
      key: 'description',
      type: 'string',
      display: 'Description',
    },
  },
};

// GENERATOR_TYPE='component';
