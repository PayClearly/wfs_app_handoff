import createSelector from 'selector';

// Third Party Imports ...

const JobsSelector = createSelector(
  (state) => state.organization.data.id,
  (state) => state.account.data.id,
  (state) => state.forms['Components.forms.jobsearch'].default._values,
  (state) => state.jobs.statements.data.items,
  (state) => state.jobs.reports.data.items,
  (state) => state.jobs.transactionDetails.data.items,
  (state) => state.jobs.payments.data.items,
  (state) => state.jobs.createBatchPayment.data.items,
  (state) => state.jobs.updateBatchPayment.data.items,
  (state) => state.jobs.paymentPipeline.data.items,
  (state) => state.jobs.wfsTransfers.data.items,
  (state) => state.jobs.wfsTransactions.data.items,

  (organizationId = null, accountId = null, jobFilter = {}, statements, reports, transactionDetails, payments, createBatchPayment, updateBatchPayment, paymentPipeline, wfsTransfers, wfsTransactions) => {
    if (!organizationId || !accountId) {
      return [];
    }

    let fetched = false;
    // have to add a type to the job for the path in the DB
    // also want to add a nicely formatted field for display purposes
    const getTypeDisplay = (type) => {
      const types = {
        statements: 'Statements',
        reports: 'Reports',
        transactionDetails: 'Transaction Details',
        payments: 'Payments',
        paymentPipeline: 'Payment Pipeline',
        createBatchPayment: 'Batch Create',
        updateBatchPayment: 'Batch Update',
        wfsTransfers: 'WFS Account Relief',
        wfsTransactions: 'WFS Settlement File',
      };
      return types[type];
    };
    const getJobs = (jobs, type) => Object.values(jobs || {}).map((job) => ({
      ...job,
      type,
      typeDisplay: getTypeDisplay(type),
    }));

    const jobTypes = {
      statements: _try(() => statements[organizationId][accountId], {}),
      reports: _try(() => reports[organizationId][accountId], {}),
      transactionDetails: _try(() => transactionDetails[organizationId][accountId], {}),
      payments: _try(() => payments[organizationId][accountId], {}),
      createBatchPayment: _try(() => createBatchPayment[organizationId][accountId], {}),
      updateBatchPayment: _try(() => updateBatchPayment[organizationId][accountId], {}),
      paymentPipeline: _try(() => paymentPipeline[organizationId][accountId], {}),
      wfsTransfers: _try(() => wfsTransfers[organizationId][accountId], {}),
      wfsTransactions: _try(() => wfsTransactions[organizationId][accountId], {}),
    };

    const jobs = [];
    Object.keys(jobTypes).forEach((jobType) => {
      if (!fetched) { fetched = true; }
      jobs.push(...getJobs(jobTypes[jobType], jobType));
    });
    const result = jobs.filter((job) => job.createdAt > jobFilter.startDate.getTime() && job.createdAt < (jobFilter.endDate.getTime() + 1000 * 60 * 60 * 24));

    return {
      jobs: result,
      fetched,
    };
  }
);

export default JobsSelector;

