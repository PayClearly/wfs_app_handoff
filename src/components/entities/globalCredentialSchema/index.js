import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    form: _try(() => state.forms['Components.forms.globalCredentialSchema'][props.id], {}),
    policies: Selectors.entity('globalVendors_*')(state),
    status: state.global.credentialSchemas.status,
    credentialSchema: _try(() => state.global.credentialSchemas.data.items[props.id], {}),
    standardCredentialFields: _resolve(state, 'global.standardCredentialFields.data.items', {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateSchema: (id, data) => {
      return dispatch(Store.global.updateGlobalCredentialSchema(id, data));
    },
    clearStatusErrors: () => {
      return dispatch(Store.global.clearErrorsGlobalCredentialSchemas());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_entities_globalCredentialSchema extends Component {
  state = {
    formName: 'Components.forms.globalCredentialSchema',
    editBtnText: 'Edit Credential Schema',
  }




  onSubmit = () => {
    const { credentialSchema, form, standardCredentialFields } = this.props;
    const values = _try(() => form._values, {});

    const data = {
      name: values.name,
      active: values.active,
      fields: Object.values(standardCredentialFields).reduce((acc, field) => {
        if (values[`${field.key}IsUsed`]) {
          acc[field.key] = {
            key: field.key,
            required: values[`${field.key}IsRequired`] || null,
          };
        }

        return acc;
      }, {}),
    };

    this.props.updateSchema(credentialSchema._id, data);
  }

  onCancel = () => {
    this.setState({ blurAll: false });
  }

  render() {
    const { id, credentialSchema, status, policies, clearStatusErrors, form = {} } = this.props;

    const error = status.updatingError;
    const updating = status.updating;
    const updateDisabled = updating || !form._allValid || form._allInitial;

    return (
      <div className="components_entities_globalCredentialSchema p-3">
        <Components.entities.entitywrapper
          canRead={policies.canRead}
          canUpdate={policies.canUpdate}
          canDelete={policies.canDelete}
          onSubmit={this.onSubmit}
          onCancel={this.onCancel}
          clearStatusErrors={clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={this.state.editBtnText}
          onDisabledClick={() => { this.setState({ blurAll: true }); }}
        >
          <Components.overviews.globalCredentialSchema id={id} />
          <Components.forms.globalCredentialSchema
            formKey={id}
            blurAll={this.state.blurAll}
            initialData={credentialSchema}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_entities_globalCredentialSchema);


