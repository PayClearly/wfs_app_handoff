import createSelector from 'selector';

// import Utils from 'utils';
// import Selectors from 'selectors';

const selectors_usersAssignedToAccountVendorEnrollments = createSelector('selectors_usersAssignedToAccountVendorEnrollments',

  state => state.account.accountVendorEnrollments.data.items,

  (accountVendorEnrollments = {}) => {
    const toReturn = {};
    Object.keys(accountVendorEnrollments).forEach((vendorId) => {
      const accountVendorEnrollment = accountVendorEnrollments[vendorId] || {};
      if (accountVendorEnrollment.assignedTo) {
        toReturn[accountVendorEnrollment.assignedTo] = true;
      }
    });

    return toReturn;
  }

);

export default selectors_usersAssignedToAccountVendorEnrollments;


