

// Third Party Imports ...

import Utils from 'utils';

const selectors_uploadLineItems = (key) => {

  return Utils.cachedSelector('selectors_uploadLineItems', key,

    state => state.forms['Components.forms.lineItems'][key],

    (form = { _allValid: true }) => {
      const lineItems = Object.keys(form._values || {}).reduce((acc, valueKey) => {
        const [, id, field] = valueKey.split('_');
        const idNumber = parseInt(id, 10);

        // get value
        let value = form._values[valueKey];
        if ((field === 'amount' || field === 'balance' || field === 'discount') && value) value = Utils.convertToAmount(value);
        if (acc.data[id]) {
          acc.data[id][field] = value;
        } else { // have not set this line item yet, init
          acc.data[id] = { [field]: value, isReady: true };

          // increment count
          acc.count += 1;

          // update maximum id
          if (idNumber > acc.maxId) acc.maxId = idNumber;

          acc.data[id].id = idNumber;
        }

        // look up errors for table
        if (acc.data[id].isReady && form[valueKey].error) {
          acc.data[id].isReady = false;
        }

        return acc;
      }, { count: 0, data: {}, maxId: 0 });

      return { form, ...lineItems };
    }
  );

};

export default selectors_uploadLineItems;

