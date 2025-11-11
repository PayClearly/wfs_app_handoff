import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    organizationRoleStatus: state.organization.roles.status,
    policies: Selectors.entity('privileges_grantedTo_idOrganization_*')(state),
    orgId: state.organization.data.id,
    accountId: state.account.data.id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateOrganizationRole: (userId, role) => {
      dispatch(Store.organization.updateOrganizationalRoles(userId, role));
    },
    clearStatusErrors: () => {
      dispatch(Store.organization.clearErrorsOrganizationRoles());
    },
  });
};

class components_entities_userorganizationrole extends Component {

  state = {
    formName: 'OrganizationRoleForm',
    editBtnText: 'Edit Organizational Role',
  };




  onSubmit = () => {
    const form = this.props.forms[this.state.formName][this.props.id];
    const data = {
      role: form.role.value,
    };

    this.props.updateOrganizationRole(this.props.id, data.role);
  }

  render() {

    const { canRead, canDelete, canUpdate } = this.props.policies;

    const error = this.props.organizationRoleStatus.updatingError;
    const updating = this.props.organizationRoleStatus.updating;
    const form = (this.props.forms[this.state.formName] && this.props.forms[this.state.formName][this.props.id]) || {};
    const updateDisabled = updating || !form._allValid || form._allInitial;

    const { roles } = this.props;
    const organizationRole = roles.organization.split('_')[1] || roles.organization;

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
            <strong>Organization Role</strong>
            <br />
            <p className="text-muted">{organizationRole}</p>
          </div>
        </div>
        <Components.forms.role
          id={this.props.id}
          initialFormData={roles.organization}
          formName={this.state.formName}
          roleLevel="organization"
          updating={updating}
        />
      </Components.entities.entitywrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_userorganizationrole);


