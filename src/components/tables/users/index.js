import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  users: _try(() => Selectors.usersTableData(state), {}),
  filteredAndSortedItems: Selectors.tableItems('Components.tables.users', props.tableKey, 'Selectors.usersTableData(state)')(state),
  policies: {
    accountRole: Selectors.entity('privileges_grantedTo_idOrganization_idAccount')(state),
    organizationRole: Selectors.entity('privileges_grantedTo_idOrganization_*')(state),
    adminRole: Selectors.entity('privileges_grantedTo_*_*')(state),
  },
});

const mapDispatchToProps = (dispatch, props) => ({
  openResetPasswordModal: (email) => {
    dispatch(Store.router.openModal('Components.modals.resetpassword', { email }));
  },
  openRemoveRolesModal: (id, email) => {
    dispatch(Store.router.openModal('Components.modals.removeroles', { id, email }));
  },
  openResendUserInviteModal: (id) => {
    dispatch(Store.router.openModal('Components.modals.resendUserInvite', { id }));
  },
});

function StatusVerified(verified) {
  if (typeof verified === 'boolean') {
    return verified
      ? <span className="badge rounded-pill bg-primary">Verified</span>
      : <span className="badge rounded-pill bg-secondary">Invited</span>;
  }
}

class components_tables_users extends Component {

  state = {
    columns,
  };

  componentDidMount() {
    const canReadAdmin = _try(() => this.props.policies.adminRole.canRead);
    const canReadOrg = _try(() => this.props.policies.organizationRole.canRead);
    const canReadAccount = _try(() => this.props.policies.accountRole.canRead);

    if (canReadAdmin || canReadOrg || canReadAccount) {
      this.setState((prevState) => ({
        columns: [
          columns[0],
          ...(canReadAdmin ? [{ label: 'Admin Role', dataKey: 'adminRole', sortable: true }] : []),
          ...(canReadOrg ? [{ label: 'Org Role', dataKey: 'organizationRole', sortable: true }] : []),
          ...(canReadAccount ? [{ label: 'Account Role', dataKey: 'accountRole', sortable: true }] : []),
          columns[1],
        ],
      }));
    }
  }

  componentWillReceiveProps(nextProps = {}) {
    const canReadAdminChanged = _try(() => this.props.policies.adminRole.canRead) !== _try(() => nextProps.policies.adminRole.canRead);
    const canReadOrgChanged = _try(() => this.props.policies.organizationRole.canRead) !== _try(() => nextProps.policies.organizationRole.canRead);
    const canReadAccountChanged = _try(() => this.props.policies.accountRole.canRead) !== _try(() => nextProps.policies.accountRole.canRead);

    if (canReadAdminChanged || canReadOrgChanged || canReadAccountChanged) {
      const canReadAdmin = _try(() => nextProps.policies.adminRole.canRead);
      const canReadOrg = _try(() => nextProps.policies.organizationRole.canRead);
      const canReadAccount = _try(() => nextProps.policies.accountRole.canRead);

      this.setState((prevState) => ({
        columns: [
          columns[0],
          ...(canReadAdmin ? [{ label: 'Admin Role', dataKey: 'adminRole', sortable: true }] : []),
          ...(canReadOrg ? [{ label: 'Org Role', dataKey: 'organizationRole', sortable: true }] : []),
          ...(canReadAccount ? [{ label: 'Account Role', dataKey: 'accountRole', sortable: true }] : []),
          columns[1],
        ],
      }));
    }
  }



  rowRenderer = (rowId, rowData, expanded) => (
    <div className="card" style={{ border: 'none' }}>
      <div className="card-body">
        <div className="row mb-4">
          <Components.entities.useradminrole
            id={rowId}
            roles={rowData.roles}
          />
          <Components.entities.userorganizationrole
            id={rowId}
            roles={rowData.roles}
          />
          <Components.entities.useraccountrole
            id={rowId}
            roles={rowData.roles}
          />
        </div>
        {this.props.policies.accountRole.canUpdate
          && <div className="row float-end mt-4 mb-4">
            {this.props.policies.adminRole.canUpdate
              && <button
                onClick={() => this.handleDeactivateUserClicked(rowId)}
                className="btn btn-danger me-3"
                type="button"
                aria-label="deactivate user button"
                disabled={false}
              >Deactivate User
              </button>}
            {rowData.verified
              && <button
                onClick={() => this.handleResetPasswordClicked(rowId)}
                className="btn btn-secondary me-4"
                type="button"
                aria-label="reset password button"
                disabled={false}
              >Send Password Reset Email
              </button>}
            {
              !rowData.verified
              && <button
                onClick={() => this.handleResendUserInvite(rowId)}
                className="btn btn-secondary me-4"
                type="button"
                buttonText="Resend User Invite"
                aria-label="Resend User Invite"
                disbled={false}
              >Resend User Invite
              </button>
            }
          </div>}
      </div>
    </div>
  );

  handleResendUserInvite(rowId) {
    this.props.openResendUserInviteModal(rowId);
  }

  handleResetPasswordClicked(id) {
    const email = _try(() => this.props.users[id].email);
    this.props.openResetPasswordModal(email);
  }

  handleDeactivateUserClicked(id) {
    const email = _try(() => this.props.users[id].email);
    this.props.openRemoveRolesModal(id, email);
  }

  render() {
    const { columns } = this.state;
    const { users, filteredAndSortedItems } = this.props;
    return (
      <Fragment>
        <Components.tables.components.multiFilter
          tableName="Components.tables.users"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig}
        />
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.users"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            filters: {
              notPermissioned: {
                key: 'notPermissioned', type: 'bool', comparator: 'is', value: false,
              },
            },
            sort: {
              sortKey: 'email',
              orderIn: 'asc',
              tieBreakKey: '_id',
            },
          }}
          data={{
            items: users,
            count: _try(() => Object.keys(users).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Users"
          paginate
          initialRowsPerPage={25}
          enableExportCSV
          exportName="Users"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_users);

// Internal Helper Functions ...
const columns = [
  { label: 'Email', dataKey: 'email', sortable: true },
  {
    label: 'Verified', dataKey: 'verified', sortable: true, cellRenderer: StatusVerified, exportFormatter: (verified) => (verified ? 'Verified' : 'Invited'),
  },
];

const filterConfig = {
  verified: {
    key: 'verified',
    type: 'bool',
    display: 'Verified',
  },
  email: {
    key: 'email',
    type: 'string',
    display: 'Email',
  },
};

