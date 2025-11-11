import createSelector from 'selector';



const selectors_approvedStatements = createSelector('selectors_approvedStatements',

  state => state.organization.data.id,
  state => state.account.data.id,
  state => state.statements.data.items,

  (organizationId = null, accountId = null, statements = {}) => {
    const contextStatements = _try(() => statements[organizationId][accountId]);
    return Object.keys(contextStatements || {}).reduce((acc, cur) => {
      if (contextStatements[cur].status === 'approved') acc[cur] = contextStatements[cur];
      return acc;
    }, {});
  }
);

export default selectors_approvedStatements;


