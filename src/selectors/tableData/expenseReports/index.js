import createSelector from 'selector';


import Utils from 'utils';

const selectors_tableData_expenseReports = createSelector(

  state => state.account.expenseReports.data.items,
  state => state.account.expenses.data.items,
  state => state.account.expenseReportApprovals.data.items,

  (expenseReports = {}, expenses = {}, expenseReportApprovals = {}) => {
    const expenseReportsTableData = { items: {}, count: 0 };

    const expenseReportsKeys = Object.keys(expenseReports);
    expenseReportsTableData.count = expenseReportsKeys.length;
    expenseReportsKeys.forEach((expenseReportId) => {
      const expenseReport = expenseReports[expenseReportId];

      const { recordCount, recordTotal, reimbursableTotal } = _try(() => Object.keys(expenseReport.expenseIds), []).reduce((acc, expenseId) => {
        const expense = _try(() => expenses[expenseId], {});

        acc.recordCount += 1;
        acc.recordTotal = expense.amount ? Utils.addDollars([expense.amount, acc.recordTotal]) : 0;

        // What is reimbursable??
        if (expense.source === 'manual') {
          if (expense.reimbursable) acc.reimbursableTotal += expense.amount || 0;
        } else {
          if (!expense.personal) acc.reimbursableTotal += expense.amount || 0;
        }

        return acc;
      }, { recordCount: 0, recordTotal: 0, reimbursableTotal: 0 });

      let status = 'open';
      if (expenseReport.approvalId) {
        status = 'approved';
        if (_try(() => expenseReportApprovals[expenseReport.approvalId].reimbursed)) status = 'reimbursed';
      } else if (expenseReport.rejected) status = 'rejected';
      else if (expenseReport.submitted) status = 'submitted';

      expenseReportsTableData.items[expenseReportId] = {
        ...expenseReport,
        recordCount,
        recordTotal,
        reimbursableTotal,
        status,
        completedReport: status === 'approved' || status === 'reimbursed',
        description: `${expenseReport.name} (E_${expenseReport._ref})`,
      };
    });

    return expenseReportsTableData;
  }

);

export default selectors_tableData_expenseReports;


