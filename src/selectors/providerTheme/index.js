import { createSelector } from 'reselect';

const providerTheme = createSelector(

  state => state.appConfig.data.providerTheme,

  (theme = {}) => {

    return {
      disableCopyright: theme.disableCopyright || false,
      disableTerms: theme.disableTerms || false,
      displayName: theme.displayName || 'WFS',
      displayNamePlural: theme.displayNamePlural || 'WFS\'s',
      supportEmail: theme.supportEmail || 'CHANGE_ME',
      supportPhone: theme.supportPhone || 'CHANGE_ME',
    };
  }
);

export default providerTheme;
