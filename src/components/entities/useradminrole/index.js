import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('privileges_grantedTo_*_*')(state),
    adminRoleStatus: state.admin.roles.status,
    orgId: state.organization.data.id,
    accountId: state.account.data.id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateAdminRole: (userId, role) => {
      dispatch(Store.admin.updateAdminRoles(userId, role));
    },
    clearStatusErrors: () => {
      dispatch(Store.admin.clearErrorsAdminRoles());
    },
  });
};

class components_entities_useradminrole extends Component {

  state = {
    formName: 'AdminRoleForm',
    editBtnText: 'Edit Admin Role',
  };




  onSubmit = () => {
    const form = this.props.forms[this.state.formName][this.props.id];
    const data = {
      role: form.role.value,
    };

    this.props.updateAdminRole(this.props.id, data.role);
  }

  render() {
    const { canRead, canDelete, canUpdate } = this.props.policies;

    const error = this.props.adminRoleStatus.updatingError;
    const updating = this.props.adminRoleStatus.updating;
    const form = (this.props.forms[this.state.formName] && this.props.forms[this.state.formName][this.props.id]) || {};
    const updateDisabled = updating || !form._allValid || form._allInitial;

    const { roles } = this.props;
    const adminRole = roles.admin.split('_')[1] || roles.admin;

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
            <strong>Admin Role</strong>
            <br />
            <p className="text-muted">{adminRole}</p>
          </div>
        </div>
        <Components.forms.role
          id={this.props.id}
          initialFormData={roles.admin}
          formName={this.state.formName}
          roleLevel="admin"
          updating={updating}
        />
      </Components.entities.entitywrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_useradminrole);


