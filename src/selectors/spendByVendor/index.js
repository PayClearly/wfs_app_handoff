import createSelector from 'selector';


import Utils from 'utils';
import Selectors from 'selectors';

const selectors_spendByVendor = createSelector('selectors_spendByVendor',

  state => Selectors.payments(state),
  state => state.account.paymentStatuses.data.items,
  state => state.account.paymentStatuses.status,
  state => Selectors.context(state),
  state => state.account.accountVendors.data.items,

  (paymentsData = {}, paymentStatuses, paymentStatusesStatus, context, vendors = {}) => {


    let formattedSpendByVendorData = null;
    if ((context.organizationId === 'org-for-testing-policies' || context.organizationId === '57245f0a-7f86-4b55-9350-4a27a385f189' || _try(() => window.GLOBALCERT.projectId.includes('STAGING-ENV_CHANGE-ME'))) && _try(() => context.account._options._useSampleDashboard)) {
      // Test data
      formattedSpendByVendorData = _formatSpendByVendorData(paymentTestStatuses, vendorsTest, Object.keys(paymentTestStatuses));
    } else {
      // App data, actual implementation (uncomment to use real data)
      formattedSpendByVendorData = _try(() => paymentStatusesStatus.fetched) && _try(() => paymentsData.fundedPayments) && _formatSpendByVendorData(paymentStatuses, vendors, paymentsData.fundedPayments);
    }

    return formattedSpendByVendorData;
  }

);

export default selectors_spendByVendor;

// Internal Helper Functions ...
// function _daysInMonth(month, year) {
//   return new Date(year, month, 0).getDate();
// }

function _formatSpendByVendorData(paymentStatuses, vendors, fundedPayments) {
  const date = new Date();
  const thisMonth = date.getMonth() + 1;
  const thisYear = date.getFullYear();

  const lastThreeMonthsMetadata = _generateLastThreeMonthsMetadata(thisMonth, thisYear);

  const initialVendorData = fundedPayments.reduce((acc, paymentId) => {
    const vendorId = paymentStatuses[paymentId].created.vendorId;

    const paymentFundedDate = new Date(paymentStatuses[paymentId].funded._at);
    const paymentMonth = paymentFundedDate.getMonth() + 1;
    const paymentYear = paymentFundedDate.getFullYear();
    if (acc[paymentMonth] && acc[paymentMonth].year === paymentYear) {
      const amountToAdd = _try(() => paymentStatuses[paymentId].created.amount, 0);
      if (!acc[paymentMonth][vendorId] && acc[paymentMonth].year === paymentYear) {
        acc[paymentMonth][vendorId] = {
          name: vendors[vendorId].name,
          amount: amountToAdd,
        };
      } else if (acc[paymentMonth].year === paymentYear) {
        acc[paymentMonth][vendorId].amount = Utils.addDollars([acc[paymentMonth][vendorId].amount, amountToAdd]);
      }
    }

    return acc;
  }, lastThreeMonthsMetadata);

  const formattedVendorData = Object.values(initialVendorData).sort((a, b) => a.sortKey - b.sortKey).map((month) => {
    //remove keys that are no longer needed
    delete month.month;
    delete month.year;
    delete month.sortKey;
    return Object.keys(month).map((vendor) => {
      return { name: month[vendor].name, value: month[vendor].amount };
    });
  });

  const sortedVendorData = formattedVendorData.map((month) => {
    return month.sort((vendor1, vendor2) => { return vendor2.value - vendor1.value; });
  });

  sortedVendorData.forEach((month, index) => {
    const otherVendors = month.length > 6 ? month.splice(6).reduce((acc, vendor) => {
      const toReturn = [...acc];
      toReturn[0].value += vendor.value;
      return toReturn;
    }, [{ name: 'Other Vendors', value: 0 }])
      :
      [];

    if (otherVendors.length) {
      sortedVendorData[index] = month.concat(otherVendors);
    }
  });

  return sortedVendorData;
}

function _generateLastThreeMonthsMetadata(thisMonth, thisYear) {
  const lastMonth = {
    month: thisMonth === 1 ? 12 : thisMonth - 1,
    year: thisMonth === 1 ? thisYear - 1 : thisYear,
  };
  const twoMonthsAgo = {
    month: thisMonth === 1 ? 11 : thisMonth === 2 ? 12 : thisMonth - 2,
    year: thisMonth === 1 || thisMonth === 2 ? thisYear - 1 : thisYear,
  };

  const monthsMetadata = {
    [thisMonth]: {
      sortKey: 0,
      month: thisMonth,
      year: thisYear,
    },
    [lastMonth.month]: {
      sortKey: 1,
      ...lastMonth,
    },
    [twoMonthsAgo.month]: {
      sortKey: 2,
      ...twoMonthsAgo
    }
  }

  return monthsMetadata;
}

/*
  ---- Test Data -----
*/
// Vendor Spend
const paymentTestStatuses = {
  1: {
    vendorId: 'a',
    created: {
      vendorId: 'a',
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
      amount: 10000,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 10000,
    payAt: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
  },
  20: {
    vendorId: 'a',
    created: {
      vendorId: 'a',
      _at: Date.parse(`${(new Date()).getMonth() + 1}/2/${(new Date()).getFullYear()}`),
      amount: 3500,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() + 1}/2/${(new Date()).getFullYear()}`),
    },
    amount: 3500,
    payAt: Date.parse(`${(new Date()).getMonth() + 1}/2/${(new Date()).getFullYear()}`),
  },
  2: {
    vendorId: 'b',
    created: {
      vendorId: 'b',
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
      amount: 8000,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 8000,
    payAt: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
  },
  3: {
    vendorId: 'c',
    created: {
      vendorId: 'c',
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
      amount: 7000,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 7000,
    payAt: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
  },
  4: {
    vendorId: 'd',
    created: {
      vendorId: 'd',
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
      amount: 6500,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 6500,
    payAt: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
  },
  5: {
    vendorId: 'e',
    created: {
      vendorId: 'e',
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
      amount: 5000,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 5000,
    payAt: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
  },
  6: {
    vendorId: 'f',
    created: {
      vendorId: 'f',
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
      amount: 4000,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 4000,
    payAt: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
  },
  7: {
    vendorId: 'g',
    created: {
      vendorId: 'g',
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
      amount: 2000,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 2000,
    payAt: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
  },
  8: {
    vendorId: 'h',
    created: {
      vendorId: 'h',
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
      amount: 1000,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 1000,
    payAt: Date.parse(`${(new Date()).getMonth() + 1}/10/${(new Date()).getFullYear()}`),
  },
  9: {
    vendorId: 'a',
    created: {
      vendorId: 'a',
      _at: Date.parse(`${(new Date()).getMonth()}/10/${(new Date()).getFullYear()}`),
      amount: 7000,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth()}/10/${(new Date()).getFullYear()}`),
    },
    amount: 7000,
    payAt: Date.parse(`${(new Date()).getMonth()}/10/${(new Date()).getFullYear()}`),
  },
  10: {
    vendorId: 'b',
    created: {
      vendorId: 'b',
      _at: Date.parse(`${(new Date()).getMonth()}/10/${(new Date()).getFullYear()}`),
      amount: 10000,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth()}/10/${(new Date()).getFullYear()}`),
    },
    amount: 10000,
    payAt: Date.parse(`${(new Date()).getMonth()}/10/${(new Date()).getFullYear()}`),
  },
  11: {
    vendorId: 'c',
    created: {
      vendorId: 'c',
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
      amount: 4000,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 4000,
    payAt: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
  },
  12: {
    vendorId: 'd',
    created: {
      vendorId: 'd',
      _at: Date.parse(`${(new Date()).getMonth()}/10/${(new Date()).getFullYear()}`),
      amount: 8000,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth()}/10/${(new Date()).getFullYear()}`),
    },
    amount: 8000,
    payAt: Date.parse(`${(new Date()).getMonth()}/10/${(new Date()).getFullYear()}`),
  },
  13: {
    vendorId: 'e',
    created: {
      vendorId: 'e',
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
      amount: 7000,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 7000,
    payAt: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
  },
  14: {
    vendorId: 'f',
    created: {
      vendorId: 'f',
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
      amount: 3500,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 3500,
    payAt: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
  },
  15: {
    vendorId: 'g',
    created: {
      vendorId: 'g',
      _at: Date.parse(`${(new Date()).getMonth()}/10/${(new Date()).getFullYear()}`),
      amount: 6200,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth()}/10/${(new Date()).getFullYear()}`),
    },
    amount: 6200,
    payAt: Date.parse(`${(new Date()).getMonth()}/10/${(new Date()).getFullYear()}`),
  },
  16: {
    vendorId: 'g',
    created: {
      vendorId: 'g',
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
      amount: 5200,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 5200,
    payAt: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
  },
  17: {
    vendorId: 'h',
    created: {
      vendorId: 'h',
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
      amount: 1500,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 1500,
    payAt: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
  },
  18: {
    vendorId: 'i',
    created: {
      vendorId: 'i',
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
      amount: 6000,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 6000,
    payAt: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
  },
  19: {
    vendorId: 'j',
    created: {
      vendorId: 'j',
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
      amount: 2300,
    },
    funded: {
      _at: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
    },
    amount: 2300,
    payAt: Date.parse(`${(new Date()).getMonth() - 1}/10/${(new Date()).getFullYear()}`),
  },
};
const vendorsTest = {
  a: {
    name: 'NCC',
  },
  b: {
    name: 'EW SCRIPPS',
  },
  c: {
    name: 'TEGNA',
  },
  d: {
    name: 'SINCLAIR BROADCASTING',
  },
  e: {
    name: 'COMCAST SPOTLIGHT',
  },
  f: {
    name: 'iHEART',
  },
  g: {
    name: 'CBS',
  },
  h: {
    name: 'ENTERCOM',
  },
  i: {
    name: 'GRAY TELEVISION',
  },
  j: {
    name: 'UNIVISION',
  },
};
// GENERATOR_TYPE='selector';
