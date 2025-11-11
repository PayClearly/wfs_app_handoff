import createSelector from 'selector';


import Utils from 'utils';
import Selectors from 'selectors';

const selectors_dailySpend = createSelector('selectors_dailySpend',

  state => Selectors.payments(state).fundedPayments,
  state => state.account.paymentStatuses.data.items,
  state => state.account.paymentStatuses.status.fetched,
  state => Selectors.context(state),

  (fundedPayments = [], paymentStatuses = {}, paymentStatusesFetched = {}, context = {}) => {
    let formattedDailySpendData = null;
    if ((context.organizationId === 'org-for-testing-policies' || context.organizationId === '57245f0a-7f86-4b55-9350-4a27a385f189' || _try(() => window.GLOBALCERT.projectId.includes('STAGING-ENV_CHANGE-ME'))) && _try(() => context.account._options._useSampleDashboard)) {
      // Test data
      const dailySpendTestPayments = _generateDailySpendTestData();
      formattedDailySpendData = _formatSpendData(dailySpendTestPayments, Object.keys(dailySpendTestPayments));
    } else {
      // App data, actual implementation (uncomment to use real data)
      formattedDailySpendData = paymentStatusesFetched && fundedPayments && _formatSpendData(paymentStatuses, fundedPayments);
    }
    return formattedDailySpendData;
  }
);

export default selectors_dailySpend;

// Internal Helper Functions ...
function _daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
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

  const monthsMetadata = [
    {
      days: _daysInMonth(thisMonth, thisYear),
      month: thisMonth,
      year: thisYear,
    },
    {
      days: _daysInMonth(lastMonth.month, lastMonth.year),
      ...lastMonth,
    },
    {
      days: _daysInMonth(twoMonthsAgo.month, twoMonthsAgo.year),
      ...twoMonthsAgo,
    },
  ];

  return monthsMetadata;
}

function _generateDefaultMonthData(thisMonth, thisYear) {
  const daysInMonths = _generateLastThreeMonthsMetadata(thisMonth, thisYear);
  return daysInMonths.reduce((acc, month, i) => {
    const defaultMonthData = {};
    for (let j = 1; j <= month.days; j += 1) {
      defaultMonthData[`${month.month}/${j}/${month.year}`] = {
        virtualCard: 0,
        Check: 0,
        ACH: 0,
      };
    }
    acc[month.month] = { sortKey: i, ...defaultMonthData };

    return acc;
  }, {})
}

function _formatSpendData(paymentStatuses, fundedPayments) {
  const todaysDate = new Date();
  const thisMonth = todaysDate.getMonth() + 1;
  const thisYear = todaysDate.getFullYear();

  const defaultMonthData = _generateDefaultMonthData(thisMonth, thisYear);

  const initialMonthData = fundedPayments.reduce((acc, paymentId) => {
    // find the payment date
    const paymentFundingDate = new Date(paymentStatuses[paymentId].funded._at);
    const paymentMonth = paymentFundingDate.getMonth() + 1;
    const spendDate = `${paymentMonth}/${paymentFundingDate.getDate()}/${paymentFundingDate.getFullYear()}`;
    // determine payment type
    const formattedStatuses = { vCard: 'virtualCard', check: 'Check', ACH: 'ACH' };
    const type = formattedStatuses[_try(() => paymentStatuses[paymentId].created.method)];

    if (_try(() => acc[paymentMonth][spendDate])) {
      const amountToAdd = _try(() => paymentStatuses[paymentId].created.amount, 0);
      const currentAmount = acc[paymentMonth][spendDate][type] || 0;
      acc[paymentMonth][spendDate][type] = Utils.addDollars([currentAmount, amountToAdd]);
    }

    return acc;
  }, defaultMonthData);

  const formattedData = Object.values(initialMonthData).sort((a, b) => a.sortKey - b.sortKey).map((month) => {
    // scrub the sortKey property from the month data object
    delete month.sortKey

    return Object.keys(month).map((day) => {
      return { name: day, ...month[day] };
    });
  });
  return formattedData;
}

function _generateDailySpendTestData() {
  const today = new Date();
  const thisMonth = today.getMonth() + 1;
  const thisYear = today.getFullYear();
  const lastMonth = {
    month: thisMonth === 1 ? 12 : thisMonth - 1,
    year: thisMonth === 1 ? thisYear - 1 : thisYear,
  };
  const twoMonthsAgo = {
    month: thisMonth === 2 ? 12 : thisMonth - 2,
    year: thisMonth === 2 ? thisYear - 1 : thisYear,
  };

  const daysInMonths = [
    {
      days: _daysInMonth(thisMonth, thisYear),
      month: thisMonth,
      year: thisYear,
    },
    {
      days: _daysInMonth(lastMonth.month, lastMonth.year),
      ...lastMonth,
    },
    {
      days: _daysInMonth(twoMonthsAgo.month, twoMonthsAgo.year),
      ...twoMonthsAgo,
    },
  ];

  let counter = 1;

  function getSinInt(amount, base, day, total) {
    return amount * Math.abs((Math.sin((day / total) * 360))) + base;
  }

  const testPaymentsData = daysInMonths.reduce((acc, month, index) => {
    const toReturn = { ...acc };

    for (let i = index === 0 ? today.getDate() : month.days; i > 0; i -= 1) {
      const cardAmount = getSinInt(30000, 50000, i, month.days);
      const ACHAmount = getSinInt(6000, 2000, i, month.days);
      const checkAmount = getSinInt(13000, 5000, i, month.days);
      toReturn[counter] = {
        paymentStrategyType: 'vCard',
        amount: cardAmount,
        payAt: Date.parse(`${month.month}/${i}/${month.year}`),
        created: {
          method: 'vCard',
          _at: Date.parse(`${month.month}/${i}/${month.year}`),
          amount: cardAmount,
        },
        funded: {
          _at: Date.parse(`${month.month}/${i}/${month.year}`),
        },
      };
      toReturn[counter + 1] = {
        paymentStrategyType: 'ACH',
        amount: ACHAmount,
        payAt: Date.parse(`${month.month}/${i}/${month.year}`),
        created: {
          method: 'ACH',
          _at: Date.parse(`${month.month}/${i}/${month.year}`),
          amount: ACHAmount,
        },
        funded: {
          _at: Date.parse(`${month.month}/${i}/${month.year}`),
        },
      };
      toReturn[counter + 2] = {
        paymentStrategyType: 'Check',
        amount: checkAmount,
        payAt: Date.parse(`${month.month}/${i}/${month.year}`),
        created: {
          method: 'check',
          _at: Date.parse(`${month.month}/${i}/${month.year}`),
          amount: checkAmount,
        },
        funded: {
          _at: Date.parse(`${month.month}/${i}/${month.year}`),
        },
      };
      counter += 3;
    }

    return toReturn;
  }, {});

  return testPaymentsData;
}

