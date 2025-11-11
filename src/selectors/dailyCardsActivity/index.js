import createSelector from 'selector';

import Utils from 'utils';
// import Selectors from 'selectors';

const selectors_dailyCardsActivity = createSelector('selectors_dailyCardsActivity',

  state => state.account.cardsIntegration.data.resources.auths,
  state => state.account.cardsIntegration.data.resources.clears,
  
  state => state.account.cardsIntegration.status.fetched,
  (auths, clears, cardsIntegrationFetched = {}) => {
    if (!cardsIntegrationFetched || !auths || !clears) return {};
    const today = new Date();
    const thisMonth = today.getMonth() + 1;
    const thisYear = today.getFullYear();
    const clearsByAuthCode = Object.values(clears).reduce((acc, cur) => {
      acc[cur.authCode] = cur;
      return acc;
    }, {});

    let authsWithoutClears = 0;
    const data = Object.keys(auths).reduce((acc, id) => {
      const { at, amount, authCode } = auths[id];
      const authDate = new Date(at);
      const formattedDate = `${authDate.getMonth() + 1}/${authDate.getDate()}/${authDate.getFullYear()}`;

      const oneWeekAgo = Date.now() - 604800000;
      if (acc[formattedDate]) {
        if (clearsByAuthCode[authCode] || authCode[0] === 'A') {
          acc[formattedDate].clears = Utils.addDollars([acc[formattedDate].clears || 0, amount]);
        } else if (at > oneWeekAgo) {
          authsWithoutClears = Utils.addDollars([authsWithoutClears, amount]);
          acc[formattedDate].auths = Utils.addDollars([acc[formattedDate].auths || 0, amount]);
        }
      }
      return acc;
    }, _generateDefaultMonthData(thisMonth, thisYear));

    let monthIndex = 0;
    let month = null;
    const cardsActivityByMonth = Object.values(data).reduce((acc, cur) => {
      const currentMonth = cur.name.split('/')[0];
      if (month && currentMonth !== month) monthIndex += 1;
      acc[monthIndex].push(cur);
      month = currentMonth;
      return acc;
    }, [[], [], []]);

    return {
      cardsActivityByMonth,
      authsWithoutClears,
    };
  }
);

export default selectors_dailyCardsActivity;

// Internal Helper Functions ... 
function _daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}
const _oneMonthAgo = (currentMonth, currentYear) => {
  return {
    month: currentMonth === 1 ? 12 : currentMonth - 1,
    year: currentMonth === 1 ? currentYear - 1 : currentYear,
  };
};

const _twoMonthsAgo = (currentMonth, currentYear) => {
  const { month, year } = _oneMonthAgo(currentMonth, currentYear);
  return _oneMonthAgo(month, year);
};

function _generateLastThreeMonthsMetadata(thisMonth, thisYear) {
  const lastMonth = _oneMonthAgo(thisMonth, thisYear);
  const twoMonthsAgo = _twoMonthsAgo(thisMonth, thisYear);

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
    { days: _daysInMonth(twoMonthsAgo.month, twoMonthsAgo.year),
      ...twoMonthsAgo,
    },
  ];

  return monthsMetadata;
}

function _generateDefaultMonthData(thisMonth, thisYear) {
  const daysInMonths = _generateLastThreeMonthsMetadata(thisMonth, thisYear);

  return daysInMonths.reduce((acc, cur) => {
    const { days, month, year } = cur;
    for (let day = 1; day <= days; day += 1) {
      const date = `${month}/${day}/${year}`;
      acc[date] = {
        name: date,
        auths: 0,
        clears: 0,
      };
    }
    return acc;
  }, {});
}

// GENERATOR_TYPE='selector';
