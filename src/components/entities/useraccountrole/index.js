import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('privileges_grantedTo_idOrganization_idAccount')(state),
    accountRoleStatus: state.account.roles.status,
    orgId: state.organization.data.id,
    accountId: state.account.data.id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateAccountRole: (userId, role) => {
      dispatch(Store.account.updateAccountRoles(userId, role));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsAccountRoles());
    },
  });
};

class components_entities_useraccountrole extends Component {

  state = {
    formName: 'AccountRoleForm',
    editBtnText: 'Edit Account Role',
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onSubmit = () => {
    const form = this.props.forms[this.state.formName][this.props.id];
    const data = {
      role: form.role.value,
    };

    this.props.updateAccountRole(this.props.id, data.role);
  }

  render() {
    const { canRead, canDelete, canUpdate } = this.props.policies;

    const error = this.props.accountRoleStatus.updatingError;
    const updating = this.props.accountRoleStatus.updating;
    const form = (this.props.forms[this.state.formName] && this.props.forms[this.state.formName][this.props.id]) || {};
    const updateDisabled = updating || !form._allValid || form._allInitial;

    const { roles } = this.props;
    const accountRole = roles.account.split('_')[1] || roles.account;

    return (
      <Components.entities.entitywrapper
        canRead={canRead}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onSubmit={this.onSubmit}
        updating={updating}
        error={error}
        updateDisabled={updateDisabled}
        editBtnText={this.state.editBtnText}
        wrapperClasses={'col-sm mt-3'}
        orgId={this.props.orgId}
        accountId={this.props.accountId}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <div className="row">
          <div className="col-md-12">
            <strong>Account Role</strong>
            <br />
            <p className="text-muted">{accountRole}</p>
          </div>
        </div>
        <Components.forms.role
          id={this.props.id}
          initialFormData={roles.account}
          formName={this.state.formName}
          roleLevel="account"
          updating={updating}
        />
      </Components.entities.entitywrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_useraccountrole);


