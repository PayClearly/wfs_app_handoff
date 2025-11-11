import createSelector from 'selector';

import Utils from 'utils';
import Selectors from 'selectors';

const selectors_tableData_accountVendorEnrollments = createSelector('selectors_tableData_accountVendorEnrollments',

  state => Selectors.accountVendorEnrollments(state),
  state => state.users.data.items,

  (accountVendorEnrollments = {}, users = {}) => {
    return Object.keys(accountVendorEnrollments || {}).reduce((acc, vendorId) => {
      const accountVendorEnrollment = accountVendorEnrollments[vendorId] || {};
      const tableData = {
        ...accountVendorEnrollment,
        status: _formatStatus(accountVendorEnrollment.status),
        accepts: _formatAccepts(accountVendorEnrollment.accepts),
      };

      if (accountVendorEnrollment.assignedTo) {
        tableData.assignedToName = users[accountVendorEnrollment.assignedTo] && users[accountVendorEnrollment.assignedTo].label;
      }
      
      acc[vendorId] = tableData;
      return acc;
    }, {});
  }

);

export default selectors_tableData_accountVendorEnrollments;

// Internal Helper Functions ... 
const _formatStatus = (status) => {
  if (status === 'inProgress') return 'In Progress';
  return Utils.capitalize(status);
};

const _formatAccepts = (accepts) => {
  return {
    vCard: !!accepts.vCard,
    check: !!accepts.check,
    ACH: !!accepts.ACH,
  };
};

