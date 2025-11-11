/* eslint no-useless-escape:0 */
import Utils from 'utils';

let count = 0;

function hasPolicy(policies, policyTemplate, orgId, accountId) {
  return policies[policyTemplate.replace('idOrganization', '*').replace('idAccount', '*')] ||
  policies[policyTemplate.replace('idOrganization', orgId).replace('idAccount', '*')] ||
  policies[policyTemplate.replace('idOrganization', orgId).replace('idAccount', accountId)];
}

const EntitySelector = (policyPrefix) => {
  return Utils.cachedSelector('selectors_entity', policyPrefix,
    state => state.user.policies.data.item,
    state => state.organization.data.id,
    state => state.account.data.id,

    (policies, organizationId, accountId) => {
      return {
        canRead: hasPolicy(policies, `${policyPrefix}_read`, organizationId, accountId),
        canUpdate: hasPolicy(policies, `${policyPrefix}_update`, organizationId, accountId),
        canDelete: hasPolicy(policies, `${policyPrefix}_delete`, organizationId, accountId),
        canCreate: hasPolicy(policies, `${policyPrefix}_create`, organizationId, accountId),
      };
    },

  );
};

export default EntitySelector;
