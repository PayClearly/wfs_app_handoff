import {
  connect, Component,
} from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => ({
  clientVendorLink: state.account?.clientVendorLinks?.data?.items?.[props.id],
  status: state.account?.clientVendorLinks?.status,
  policies: Selectors.entity('clientVendorLinks_idOrganization_idAccount')(state),
  form: state.forms?.['Components.forms.clientVendorLink']?.[props.id],
  credentialForm: state.forms?.['Components.forms.credentials']?.[props.id],
  forms: state.forms,

  vendors: state.account?.accountVendors?.data?.items,
  globalTaggedItems: Selectors.globalTaggedItems(state),
  defaultTag: state.account?.paymentPipelinePreferences?.data?.item?.defalutGlobalVendorTagId,
});

const mapDispatchToProps = (dispatch) => ({
  updateClientVendorLink: (id, data) => dispatch(Store.account.updateClientVendorLink(id, data)),
  clearStatusErrors: () => dispatch(Store.account.clearErrorsClientVendorLinks()),
});

const mapResourcesToProps = () => ({});

class components_entities_clientVendorLink extends Component {
  state = {
    formName: 'Components.forms.clientVendorLink',
    editBtnText: 'Edit Client-Vendor Link',
  };

  onSubmit = () => {
    const {
      form, clientId, vendorId, credentialForm = {},
    } = this.props;

    const data = { ...(form?._values || {}) };

    if (credentialForm && credentialForm._key) { data.credentials = credentialForm._values; }

    this.props.updateClientVendorLink(`${clientId}${clientVendorLinkIdSeparator}${vendorId}`, data);
  };

  onCancel = () => {
    this.setState({ blurAll: false });
  };

  render() {
    const {
      id,
      clientId,
      vendorId,
      clientVendorLink,
      status,
      policies,
      clearStatusErrors,
      form = {},
      credentialForm = {},
      vendors = {},
    } = this.props;

    const error = status.updatingError;
    const { updating } = status;
    const oneFormIsNotValid = !form._allValid || (credentialForm._key && !credentialForm._allValid);
    const allFormsAreInitial = form._allInitial && (credentialForm._key && credentialForm._allInitial);
    const updateDisabled = updating || oneFormIsNotValid || allFormsAreInitial;

    return (
      <div className="components_entities_clientVendorLink p-3">
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
          updateButtonText="Update Client-Vendor Link"
          onDisabledClick={() => { this.setState({ blurAll: true }); }}
        >
          <Components.overviews.clientVendorLink
            id={id}
            clientId={clientId}
            vendorId={vendorId}
            vendors={vendors}
            globalTaggedItems={this.props.globalTaggedItems}
            defaultTag={this.props.defaultTag}
          />
          <Components.forms.clientVendorLink
            formKey={id}
            blurAll={this.state.blurAll}
            initialData={{ clientId, vendorId, ...clientVendorLink }}
            forUpdate
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_entities_clientVendorLink);

// Internal Helper Functions ...
const clientVendorLinkIdSeparator = '-';

function areMultipleProceduresActive(globalData) {
  const { ACH, vCard } = globalData || {};
  if (ACH?.accepts && vCard?.accepts) {
    return true;
  }
  return false;
}
// GENERATOR_TYPE='component';
