
function hasPolicy(user, policyTemplate, orgId = null, accountId = null) {
  const policies = user.policies.data.item;
  return policies[policyTemplate.replace('idOrganization', '*').replace('idAccount', '*')] ||
  policies[policyTemplate.replace('idOrganization', orgId).replace('idAccount', '*')] ||
  policies[policyTemplate.replace('idOrganization', orgId).replace('idAccount', accountId)];
}

function readableAccounts(user, orgId) {

  // readable orgs
  const userRoles = user.roles.data.item;
  const accountRoles = (userRoles.accountLevel && userRoles.accountLevel[orgId]) || {};
  return [].concat(Object.keys({ ...accountRoles }));

}

function readableOrganizations(user) {
  // readable orgs
  const userRoles = user.roles.data.item;
  const accountRoles = userRoles.accountLevel || {};
  const orgRoles = userRoles.organizationLevel || {};
  return [].concat(Object.keys({ ...accountRoles, ...orgRoles }));
}

module.exports = {
  hasPolicy,
  readableAccounts,
  readableOrganizations,
};
