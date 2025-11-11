import createSelector from 'selector';


import Selectors from 'selectors';

const selectors_expenses = createSelector(

  state => Selectors.tableData.expenseReports(state).items,
  state => state.account.expenses.data.items,
  state => state.user.profile.data.item._id,
  state => Selectors.plasticCardAssignedToUser(state),
  state => state.account.cardsIntegration.data.resources.auths,


  (expenseReports = {}, expenses = {}, userId, pCard = {}, allAuths = {}) => {
    const toReturn = {
      availableExpenseReports: [],
      approvedExpenseReports: [],
      expenses: Object.values(expenses).filter(expense => expense.createdBy === userId),
      recentExpenses: [],
      submittedExpenseReports: [],
      activeExpenseReports: [],
      closedExpenseReports: [],
    };
    if (pCard._id) {

      const expensesBySourceId = toReturn.expenses.reduce((acc, expense) => {
        if (expense.sourceId) acc[expense.sourceId] = expense;
        return acc;
      }, {});
      const auths = Object.values(allAuths).filter((auth) => {
        // only return auths for the user's card and auths that haven't been made into an expense already
        return (auth.cardId === pCard._id) && !expensesBySourceId[auth._id];
      });
      auths.forEach(auth => toReturn.expenses.push(_transactionToExpenseMap(auth)));
    }

    toReturn.recentExpenses = toReturn.expenses.filter(expense => (Date.now() - expense.date) < 604800000);

    Object.keys(expenseReports).forEach((expenseReportId) => {
      const expenseReport = expenseReports[expenseReportId];

      if (expenseReport.createdBy === userId && !expenseReport.deleted) {
        if (expenseReport.status === 'open') {
          toReturn.availableExpenseReports.push(expenseReport);
          toReturn.activeExpenseReports.push(expenseReport);
        } else if (expenseReport.status === 'rejected') {
          toReturn.availableExpenseReports.push(expenseReport);
          toReturn.closedExpenseReports.push(expenseReport);
        } else if (expenseReport.status === 'submitted') {
          toReturn.submittedExpenseReports.push(expenseReport);
          toReturn.closedExpenseReports.push(expenseReport);
        } else {
          toReturn.approvedExpenseReports.push(expenseReport);
          toReturn.closedExpenseReports.push(expenseReport);
        }
      }
    });

    return toReturn;
  }

);

export default selectors_expenses;

// Internal Helper Functions ... 
const _transactionToExpenseMap = (auth) => {
  return {
    amount: auth.amount,
    date: auth.at,
    currency: 'USD',
    vendor: auth.merchantName,
    personal: false,
    reimbursable: false,
    // the important part
    source: 'automatic',
    sourceId: typeof auth._id === 'string' ? auth._id : auth._id.toString(),
    // fake data/flag for certain components
    _id: auth._id,
    fromTransaction: true,
  };
};
