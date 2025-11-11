/* eslint no-useless-escape:0 */

import createSelector from 'selector';


const selectors_credentialsByGroup = createSelector('selectors_credentialsByGroup',
  state => state.global.groups.data.items,
  (groups = {}) => {

    return Object.keys(groups)
    .reduce((acc, groupId) => {
      const group = groups[groupId];
      const vCardSchemaId = group.vCard && group.vCard.credentialSchema;
      const ACHSchemaId = group.ACH && group.ACH.credentialSchema;
      const checkSchemaId = group.check && group.check.credentialSchema;
      if (vCardSchemaId) {
        acc.vCard[groupId] = vCardSchemaId;
      }
      if (ACHSchemaId) {
        acc.ACH[groupId] = ACHSchemaId;
      }
      if (checkSchemaId) {
        acc.check[groupId] = checkSchemaId;
      }
     
      return acc;
    }, { vCard: {}, ACH: {}, check: {} });
  },
);

export default selectors_credentialsByGroup;

