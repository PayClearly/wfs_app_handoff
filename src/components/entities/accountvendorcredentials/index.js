import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('accountVendorCredentials_idOrganization_idAccount')(state),
    status: state.account.accountVendorCredentials.status,
    orgId: state.organization.data.id,
    accountId: state.account.data.id,
    globalVendorsCredentialSchemas: Selectors.globalTaggedItems(state).credentialSchemas,
    accountVendorCredentials: state.account.accountVendorCredentials.data.items || {},
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    update: (data) => {
      return dispatch(Store.account.setAccountVendorCredential(data));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsAccountVendorCredentials());
    },
  });
};

class components_entities_accountvendorcredentials extends Component {

  state = {
    formName: 'Components.forms.credentials',
    editBtnText: 'Edit',
  }

  onSubmit = () => {
    const schemaId = this.props.id;
    this.props.update({
      id: schemaId,
      fields: this.props.forms[this.state.formName][schemaId]._values,
    });
  }

  onCancel = () => this.setState({ blurAll: false });

  render() {

    const { canRead, canUpdate, canDelete } = this.props.policies;

    const schemaId = this.props.id;
    const credentialSchema = this.props.globalVendorsCredentialSchemas[schemaId] || {};
    const actual = _try(() => this.props.accountVendorCredentials[schemaId] && this.props.accountVendorCredentials[schemaId].fields) || {};

    const error = this.props.status.updatingError;
    const updating = this.props.status.updating;
    const form = (this.props.forms[this.state.formName] && this.props.forms[this.state.formName][schemaId]) || {};
    const updateDisabled = updating || !form._allValid;

    return (
      <div className="p-4">
        <Components.entities.entitywrapper
          canRead={canRead}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onSubmit={this.onSubmit}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={this.state.editBtnText}
          orgId={this.props.orgId}
          accountId={this.props.accountId}
          onDisabledClick={() => this.setState({ blurAll: true })}
          onCancel={this.onCancel}
          clearStatusErrors={this.props.clearStatusErrors}
        >
          <Components.accountvendorcredentials credentialSchema={credentialSchema} actual={actual} />
          <Fragment>
            <h4 className="mb-3">{credentialSchema.name}</h4>
            <Components.forms.credentials
              initialData={actual}
              credentialSchemaFields={(credentialSchema && credentialSchema.fields) || {}}
              formKey={schemaId}
              disabled={updating}
              blurAll={this.state.blurAll}
            />
          </Fragment>
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_accountvendorcredentials);

