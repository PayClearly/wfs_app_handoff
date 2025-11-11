/* eslint no-useless-escape:0 */

import createSelector from 'selector';

import objectResolvePath from 'object-resolve-path';

const PrivilegesSelector = createSelector(

  state => state.user.privileges.data.item,
  state => state.organization.data.id,
  state => state.account.data.id,
  state => state.admin.roleDefinitions.data.item,
  state => state.user.privileges.status.fetched,

  (privileges, organizationId, accountId, roleDefinitions, fetched = false) => {

    const badgerAccounts = ['c09055be-f537-4654-a070-298252640b4b', 'b099e5f5-ade1-4b03-a8aa-4f925b163f3b', '19880a6c-c6a8-4eb2-8b91-c6c9797ae11e'].some(id => id === accountId);

    return {
      fetched,
      canAudit:
        objectResolvePath(privileges, 'rootLevel.audit') ||
        objectResolvePath(privileges, `organizationLevel["${organizationId}"].audit`) ||
        objectResolvePath(privileges, `accountLevel["${organizationId}"]["${accountId}"].audit`),
      canManageTransactions:
        objectResolvePath(privileges, 'rootLevel.manageTransactions'),
      canManageAccountsAndOrganizations:
        objectResolvePath(privileges, 'rootLevel.manage') ||
        objectResolvePath(privileges, `organizationLevel["${organizationId}"].manage`) ||
        objectResolvePath(privileges, `accountLevel["${organizationId}"]["${accountId}"].manage`),
      canManageUsers:
        objectResolvePath(privileges, 'rootLevel.manageUsers') ||
        objectResolvePath(privileges, `organizationLevel["${organizationId}"].manageUsers`) ||
        objectResolvePath(privileges, `accountLevel["${organizationId}"]["${accountId}"].manageUsers`),
      canManagePayments:
        objectResolvePath(privileges, 'rootLevel.managePayments') ||
        objectResolvePath(privileges, `organizationLevel["${organizationId}"].managePayments`) ||
        objectResolvePath(privileges, `accountLevel["${organizationId}"]["${accountId}"].managePayments`),
      isBuyer:
        objectResolvePath(privileges, `accountLevel["${organizationId}"]["${accountId}"].buyer`),
      canAdministratePrivileges: {
        rootLevel: objectResolvePath(privileges, 'rootLevel.administratePrivileges'),
        organizationLevel: objectResolvePath(privileges, 'rootLevel.administratePrivileges') ||
          objectResolvePath(privileges, `organizationLevel["${organizationId}"].administratePrivileges`),
        accountLevel: objectResolvePath(privileges, 'rootLevel.administratePrivileges') ||
          objectResolvePath(privileges, `organizationLevel["${organizationId}"].administratePrivileges`) ||
          objectResolvePath(privileges, `accountLevel["${organizationId}"]["${accountId}"].administratePrivileges`),
      },
      canAdministrateReports: {
        rootLevel: objectResolvePath(privileges, 'rootLevel.administrateReports'),
        organizationLevel: objectResolvePath(privileges, 'rootLevel.administrateReports') ||
          objectResolvePath(privileges, `organizationLevel["${organizationId}"].administrateReports`),
        accountLevel: objectResolvePath(privileges, 'rootLevel.administrateReports') ||
          objectResolvePath(privileges, `organizationLevel["${organizationId}"].administrateReports`) ||
          objectResolvePath(privileges, `accountLevel["${organizationId}"]["${accountId}"].administrateReports`),
      },
      canAdministrateGlobalVendors: objectResolvePath(privileges, 'rootLevel.administrateGlobalVendors'),
      canUpdateStatus:
        objectResolvePath(privileges, 'rootLevel.updateStatus'),
      canViewAssignedCardTransactions:
        objectResolvePath(privileges, `accountLevel["${organizationId}"]["${accountId}"].viewAssignedCardTransactions`),
      roleOptions: {
        admin: Object.keys(roleDefinitions.rootLevel)
          .reduce((acc, curr) => {
            const display = curr.split('_') && curr.split('_')[1];
            if (display) {
              acc[curr] = { display };
            }
            return acc;
          }, {
            none: {
              display: 'none',
            },
          }),
        organization: Object.keys(roleDefinitions.organizationLevel)
          .reduce((acc, curr) => {
            const display = curr.split('_') && curr.split('_')[1];
            if (display) {
              acc[curr] = { display };
            }
            return acc;
          }, {
            none: {
              display: 'none',
            },
          }),
        account: Object.keys(roleDefinitions.accountLevel)
          .reduce((acc, curr) => {
            const display = curr.split('_') && curr.split('_')[1];
            if (display) {
              acc[curr] = { display };
            }
            if (badgerAccounts) {
              acc.base_editor = { display: 'editor' };
            }
            return acc;
          }, {
            none: {
              display: 'none',
            },
          }),
      },
    };
  }
);

export default PrivilegesSelector;
