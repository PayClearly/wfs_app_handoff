// Third Party Imports ...

// import Utils from 'utils';

function utils_hasPolicy(policies, policyTemplate, orgId = null, accountId = null) {
  return policies[policyTemplate.replace('idOrganization', '*').replace('idAccount', '*')] ||
    policies[policyTemplate.replace('idOrganization', orgId).replace('idAccount', '*')] ||
    policies[policyTemplate.replace('idOrganization', orgId).replace('idAccount', accountId)];
}

export default utils_hasPolicy;


