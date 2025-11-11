import createSelector from 'selector';

// Third Party Imports ...


const selectors_deviceSecurity = createSelector(

  state => state.wfs.preferences.data,
  state => state.device.biometrics.data,
  (preferences = null, biometrics = null) => {
    const { biometricsTimeout, useBiometrics } = preferences;
    const { isAvailable } = biometrics;
    const oneMinute = 60000;
    const options = [{
      label: 'Immediately',
      value: 0,
    }, /* {
      label: '1 minute',
      value: oneMinute,
    }, {
      label: '5 minutes',
      value: oneMinute * 5,
    }, {
      label: '15 minutes',
      value: oneMinute * 15,
    }, {
      label: '1 hour',
      value: oneMinute * 60,
    }, {
      label: '4 hours',
      value: oneMinute * 240,
    }*/];

    return {
      biometricsTimeout,
      useBiometrics,
      options: options.reduce((acc, cur) => {
        acc.push({
          ...cur,
          selected: biometricsTimeout === cur.value,
        });
        return acc;
      }, []),
      isAvailable,
    };
  }

);

export default selectors_deviceSecurity;


