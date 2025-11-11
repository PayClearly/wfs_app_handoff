import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('organizations_idOrganization')(state),
    organizationItem: state.organizations.data.items[state.organization.data.id],
    organizationStatus: state.organizations.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateOrganization: (organizationId, data) => {
      dispatch(Store.organizations.update(organizationId, data));
    },
    clearStatusErrors: () => {
      dispatch(Store.organizations.clearErrors());
    },
  });
};

class components_entities_organization extends Component {

  state = {
    formName: 'Components.forms.editorganization',
    editBtnText: 'Edit Organization',
  };




  onCancel = () => this.setState({ blurAll: false });

  onSubmit = () => {
    const form = this.props.forms[this.state.formName][this.props.organizationItem._id];
    const data = form._values;

    data.logo = this.props.organizationItem.logo ? [this.props.organizationItem.logo] : [];

    this.props.updateOrganization(this.props.organizationItem._id, data);
  }

  render() {
    if (!this.props.organizationItem) return null;
    const { canRead, canUpdate, canDelete } = this.props.policies;

    const error = this.props.organizationStatus.updatingError;
    const updating = this.props.organizationStatus.updating;
    const form = (this.props.forms[this.state.formName] && this.props.forms[this.state.formName][this.props.organizationItem._id]) || {};
    const updateDisabled = updating || !form._allValid || form._allInitial;

    return (
      <div className="mb-2">
        <Components.entities.entitywrapper
          canRead={canRead}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onSubmit={this.onSubmit}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={this.state.editBtnText}
          wrapperClasses={'col-md-12 mt-3'}
          orgId={this.props.organizationItem._id}
          onDisabledClick={() => { this.setState({ blurAll: true }); }}
          onCancel={this.onCancel}
          clearStatusErrors={this.props.clearStatusErrors}
        >
          <Components.organizationoverview organizationItem={this.props.organizationItem} />
          <Components.forms.editorganization
            initialFormData={this.props.organizationItem}
            updating={updating}
            blurAll={this.state.blurAll}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_organization);


