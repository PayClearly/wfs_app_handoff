
import Utils from 'utils';
// import Selectors from 'selectors';

const selectors_uploaders_clientVendorLinkForm = (key) => {

  return Utils.cachedSelector('selectors_uploaders_clientVendorLinkForm', key,

    state => state.forms['Components.forms.clientVendorLink'][key],
    state => state.forms['Components.forms.credentials'][key],
    
    (form, credentialsForm = {}) => {

      if (!form) return null;

      const adapted = _adaptToCreatable(form._values, credentialsForm);

      const invalidCredentialsForm = credentialsForm._values && !credentialsForm._allValid;

      return {
        form,
        formKey: key,
        hasCredentials: credentialsForm._values,
        credentialsFormValid: !invalidCredentialsForm,
        valid: form._allValid && !invalidCredentialsForm,
        adapted,
      };
    }
  );
};

export default selectors_uploaders_clientVendorLinkForm;

// Internal Helper Functions ... 

const _adaptToCreatable = (values, credentialsForm) => {
  return {
    _id: values.vendorId && values.clientId && `${values.clientId}${clientVendorLinkIdSeparator}${values.vendorId}` || null,
    vendorName: values.vendorName,
    clientName: values.clientName,
    vendorId: values.vendorId,
    clientId: values.clientId,
    credentials: credentialsForm._values || null,
  };
};

const clientVendorLinkIdSeparator = '-';

// GENERATOR_TYPE='selector';
