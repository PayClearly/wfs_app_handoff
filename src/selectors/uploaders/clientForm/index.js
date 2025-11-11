import createSelector from 'selector';

import Utils from 'utils';

const selectors_uploaders_clientForm = (key) => {

  return Utils.cachedSelector('selectors_uploaders_clientForm', key,

    state => state.forms['Components.forms.client'][key],
    
    (form) => {

      if (!form) return null;

      const adapted = _adaptToCreatable(form._values);
      return {
        form,
        formKey: key,
        valid: form._allValid,
        adapted,
      };
    }
  );
};

export default selectors_uploaders_clientForm;

// Internal Helper Functions ...

const _adaptToCreatable = (values) => {
  return {
    name: values.name,
    displayName: values.displayName,
    contactName: values.contactName,
    contactEmail: values.contactEmail,
  };
};

