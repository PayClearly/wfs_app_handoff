import createSelector from 'selector';

// Third Party Imports ...

import Selectors from 'selectors';

const selectors_integrations = createSelector('selectors_integrations',
  state => state.integrationDefinitions.data.items,
  state => Selectors.context(state),

  // integrations
  state => state.account.erpIntegration,
  state => state.account.cardsIntegration,
  state => state.account.checksIntegration,
  state => state.account.achIntegration,
  state => state.account.fundingIntegration,

  // we'll want all of the integrations below to work just like the ones above
  state => state.account.achAccountDetails,

  // show mocker =>
  state => Selectors.featureFlags(state).mocker,

  (definitions = {}, context = {}, erpIntegration = {}, cardsIntegration = {}, checksIntegration = {}, achIntegration = {}, fundingIntegration = {}, achAccountDetails = {}, showMocker) => {

    return {
      erpIntegration: selectIntegration(erpIntegration, 'erpIntegration', definitions, context, showMocker),
      cardsIntegration: selectIntegration(cardsIntegration, 'cardsIntegration', definitions, context, showMocker),
      fundingIntegration: selectIntegration(fundingIntegration, 'fundingIntegration', definitions, context, showMocker),
      checksIntegration: selectIntegration(checksIntegration, 'checksIntegration', definitions, context, showMocker),
      achIntegration: selectIntegration(achIntegration, 'achIntegration', definitions, context, showMocker),
      achFundingSource: {
        warning: false,
        loading: !achAccountDetails.status.fetched,
        type: achAccountDetails.data.item.type,
        name: achAccountDetails.data.item.name,
        linked: achAccountDetails.status.fetched && !!achAccountDetails.data.item.id,
        notLinked: achAccountDetails.status.fetched && !achAccountDetails.data.item.id,
      },
    };
  }

);

export default selectors_integrations;

function selectIntegration(integration, name, definitions = {}, context, showMocker) {
  const definition = definitions[name] || {};
  const preferences = Object.keys(definition.preferences || {})
    .reduce((acc, item) => {
      acc[item] = _try(() => integration.data.preferences[item], null);
      return acc;
    }, {});
  const possiblePreferences = _getPossiblePreferences(integration, definitions, name);

  // Remove and add as funding options for setup
  preferences.fundingStrategy = 'earmark'; // TODO, remove
  preferences.automaticFundingType = 'eod'; // TODO, remove

  const possibleProviders = Object.keys(_try(() => definition.providers, {}))
    .reduce((acc, curr) => {
      const provider = definition.providers[curr];
      if (showMocker && (curr === 'STUB' || curr === 'CHANGE_ME_PROVIDER_STUB')) {
        acc[curr] = { ...provider, prod: true };
      } else {
        acc[curr] = provider;
      }
      return acc;
    }, {});

  const providerInfo = _try(() => definition.providers[integration.data.details.provider]);
  // settings setup
  const settings = _determineSettings(definition.settings, _try(() => providerInfo.settings, {}), _try(() => integration.data.details.settingOverrides, {}));

  return {
    loading: !integration.status.fetched,
    type: integration.data.details.provider || '',
    details: integration.data.details,
    display: definition.display,
    provider: integration.data.details.provider || '',
    providerInfo,
    possibleProviders,
    requiresSetup: _try(() => integration.data.details.requiresSetup, false),
    name: definition.name,
    linked: integration.data.details.linkedAt,
    notLinked: !integration.data.details.linkedAt,
    lastUpdated: integration.data.details._sync_lastSuccess,
    preferences,
    possiblePreferences,
    possibleResources: definition.resources,
    data: integration.data,
    status: integration.status,
    settings,
    errors: {
      moreInfoNeeded: _try(() => Object.keys(possiblePreferences).some(preferenceKey => !preferences[preferenceKey] && possiblePreferences[preferenceKey].required)),
      errorSyncing: _try(() => integration.data.details._sync_error.message),
    },
    warnings: { // TODO
      longTimeSinceSync: false, // it has been a long time since _sync has ran
      queueIsLarge: false, // there are a lot of items that are queued
      resourceErrors: false, // some of the resources have errors
    },
  };
}


// private helpers

function _determineSettings(integrationLevel = {}, providerLevel = {}, accountLevel = {}) {
  const settings = {};

  Object.keys(integrationLevel).forEach((settingKey) => {
    if (Object.prototype.hasOwnProperty.call(accountLevel, settingKey) && integrationLevel[settingKey].allowsOverride) {
      settings[settingKey] = accountLevel[settingKey];
    } else if (Object.prototype.hasOwnProperty.call(providerLevel, settingKey)) {
      settings[settingKey] = providerLevel[settingKey];
    } else {
      // here we can set the values to the defaults if we think that's important
    }
  });

  return settings;
}

function _getPossiblePreferences(integration, definitions, name) {
  const provider = integration.data.details.provider;
  const possiblePreferences = {};
  _try(() => Object.keys(definitions[name].preferences || {}), []).forEach((key) => {
    // Add preference if:

    // 1) Preference has neither specifier flag
    const noFlags = !_try(() => definitions[name].preferences[key].only.length) && !_try(() => definitions[name].preferences[key].except.length);

    // 2) Preference has only flag and provider is included
    const isOnly = _try(() => definitions[name].preferences[key].only.includes(provider));
    // 3) Preference has except flag and provider is not included
    const isNotExcept = !_try(() => definitions[name].preferences[key].except.includes(provider));

    if (noFlags || isOnly || isNotExcept) possiblePreferences[key] = definitions[name].preferences[key];
  });
  return possiblePreferences;
}
