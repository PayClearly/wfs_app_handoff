import createSelector from 'selector';

import Selectors from 'selectors';

const selectors_accountVendorEnrollments = createSelector('selectors_accountVendorEnrollments',

  state => Selectors.accountVendors(state).all,
  state => state.account.accountVendorEnrollments.data.items,

  (accountVendors = {}, accountVendorEnrollments = {}) => {
    const toReturn = {};
    Object.keys(accountVendors).forEach((vendorId) => {
      const accountVendor = accountVendors[vendorId];
      const accountVendorEnrollment = accountVendorEnrollments[vendorId] || {};

      toReturn[vendorId] = {
        vendorDisplay: accountVendor.display,
        vendorId: accountVendor.name,
        vendorDisplayName: accountVendor.displayName,
        accepts: accountVendor.accepts,
        contactName: accountVendor.contactName,
        contactEmail: accountVendor.contactEmail,
        contactPhoneNumber: accountVendor.contactPhoneNumber,
        contactFaxNumber: accountVendor.contactFaxNumber,
        notCreated: !accountVendorEnrollment._id,
        status: 'pending',
        ...accountVendorEnrollment,
      };
    });

    return toReturn;
  }

);

export default selectors_accountVendorEnrollments;


