import createSelector from 'selector';


// Third Party Imports ...

import Utils from 'utils';

const selectors_eventDefinitions = createSelector(
  state => state.organization.data.id,
  state => state.account.data.id,
  state => state.eventDefinitions.data.items,
  state => state.user.policies.data.item,

  (organizationId = null, accountId = null, events = {}, policies = []) => {

    const userDoesHaveCorrectPolicies = (userPolicies = [], eventPolicies) => {
      let res = true;
      userPolicies.forEach((policy) => {
        const hasPolicy = Utils.hasPolicy(eventPolicies, policy, organizationId, accountId);
        if (!hasPolicy) {
          res = false;
        }
      });
      return res;
    };

    const organized = Object.keys(events).reduce((acc, cur) => {
      const userHasPolicy = userDoesHaveCorrectPolicies(events[cur].policies, policies);
      if (userHasPolicy) {
        const topic = events[cur].topic;
        if (!acc[topic]) acc[topic] = [];
        acc[topic].push(events[cur]);
      }
      return acc;
    }, {});

    return {
      ...organized,
    };
  }
);

export default selectors_eventDefinitions;


