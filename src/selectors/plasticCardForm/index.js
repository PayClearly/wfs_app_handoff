
import Utils from 'utils';

const selectors_plasticCardForm = (key) => {

  return Utils.cachedSelector('selectors_plasticCardForm', key,

    state => state.forms['Components.forms.plasticcard'][key],

    (form = {}) => {

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

export default selectors_plasticCardForm;

const _adaptToCreatable = (values) => {
  return values;
};

