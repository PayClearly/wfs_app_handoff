

// Third Party Imports ...

import Utils from 'utils';

const selectors_tableData_lineItems = (key) => {

  return Utils.cachedSelector('selectors_tableData_lineItems', key,

    state => state.account.paymentStatuses.data.items[key],

    (paymentStatus = {}) => {
      if (!_resolve(paymentStatus, 'created.lineItems', []).length) return {};

      const lineItems = paymentStatus.created.lineItems.reduce((acc, lineItem, index) => {
        const _id = index;

        acc[_id] = { ...lineItem, _id };
        return acc;
      }, {});

      return lineItems;
    }
  );

};

export default selectors_tableData_lineItems;


