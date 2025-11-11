import createSelector from 'selector';


import Utils from 'utils';
import Selectors from 'selectors';

const selectors_routeConfig = createSelector(

  (state) => Selectors.context(state),
  (state) => state.router.route,
  (state) => state.appConfig.data.router.routes,
  (state) => Selectors.privileges(state),
  (state) => Selectors.featureFlags(state),
  (state) => state.user.policies.data.item,
  (state) => state.appConfig.data.router.categories,

  (
    context = {},
    route = {},
    routes = [],
    userPrivileges = {},
    featureFlags = {},
    userPolicies = {},
    routerCategories = {}
  ) => {

    const { organizationId, accountId } = context;
    const routeData = routes.find((r) => r.name === route.name) || {};

    const routePrivilegePerimission = routeData.onlyShowWithPrivileges
      ? routeData.onlyShowWithPrivileges.some((key) => userPrivileges[key]) : true;
    const routePolicyPermission = routeData.onlyShowWithSpecificPolicies
      ? routeData.onlyShowWithSpecificPolicies.some((policy) => Utils.hasPolicy(userPolicies, policy, organizationId, accountId)) : true;

    const { category } = routeData;
    let userHasCategoryPrivileges = true;
    const categoryRequiredPrivileges = routerCategories[category] && routerCategories[category].onlyShowWithPrivileges;
    if (categoryRequiredPrivileges) {
      userHasCategoryPrivileges = categoryRequiredPrivileges.some((privilege) => userPrivileges[privilege]);
    }

    const filteredTabs = routeData.tabs
      && routeData.tabs.filter((tab) => {
        const tabPolicyPermission = tab.policies ? tab.policies.some((policy) => Utils.hasPolicy(userPolicies, policy, organizationId, accountId)) : true;
        const tabPrivilegePermission = tab.privileges ? tab.privileges.some((privilege) => userPrivileges[privilege]) : true;
        const tabFeatureFlag = tab.featureFlag ? featureFlags[tab.featureFlag] : true;
        return (tabPolicyPermission && tabPrivilegePermission && tabFeatureFlag);
      });

    const loaded = userPrivileges.fetched || false;
    // const loaded = _try(() => routeData.loaded, []).every((condition) => {
    //   return _try(() => Utils.getNestedProperty(condition, totalState));
    // });

    return {
      ...routeData,
      routePermission: userHasCategoryPrivileges && routePrivilegePerimission && routePolicyPermission,
      tabs: filteredTabs,
      routeDataLoaded: loaded,
    };
  }

);

export default selectors_routeConfig;


