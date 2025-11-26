
import Utils from 'utils';

const selectors_paymentcardform = (key) => Utils.cachedSelector(
  'selectors_paymentcardform',
  key,
  (state) => state.forms['Components.forms.paymentCard'][key],
  (state) => state.forms['Components.forms.custom'][`paymentCardFields-${key}`],
  (form = {}, paymentCardFieldsForm = { _allValid: true }) => {

    if (!form) {
      return null;
    }

    const adapted = _adaptToCreatable(form._values, paymentCardFieldsForm);

    return {
      form,
      formKey: key,
      paymentCardFieldsFormValid: !!paymentCardFieldsForm._allValid,
      valid: form._allValid && !!paymentCardFieldsForm._allValid,
      adapted,
    };
  }
);

export default selectors_paymentcardform;

const _adaptToCreatable = (values, customFieldsForm) => {
  const trigger = _try(() => values.triggerType, null) && {
    type: values.triggerType,
    min: values.triggerMin || null,
    max: values.triggerMax,
    frequency: values.triggerFrequency || null,
    specificDate: Number(values.specificDate) || null,
  };
  return {
    customFields: customFieldsForm._values || {},
    name: values?.name || '',
    method: 'vCard',
    virtualCard: {
      amount: values?.amount || '',
      validThrough: _try(() => new Date(values.validThrough), ''),
      maxUses: values?.maxUses || '99999',
      region: values?.region || 'USA',
      bin: values?.bin || '',
    },
    trigger,
    fundingAmount: Number(parseFloat(values?.amount || 0).toFixed(2)),
  };
};

