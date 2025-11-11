import { FingerprintAIO } from '@ionic-native/fingerprint-aio';

const DEFAULT_OPTIONS = {
  platform: 'browser',
  title: 'Biometric Authentication',
  subtitle: '',
  description: 'Please authenticate',
  disableBackup: false,
};

const BiometricsAPI = async (options = DEFAULT_OPTIONS) => {
  return {
    show: _show(options.platform),
    isAvailable: _isAvailable(options),
  };
};

export default BiometricsAPI;

const _show = (platform) => {
  return (overrides = {}) => {
    const options = { ...overrides };

    if (platform === 'android') {
      options.title = options.title || DEFAULT_OPTIONS.title;
      options.subtitle = options.subtitle || DEFAULT_OPTIONS.subtitle;
    }

    return FingerprintAIO.show(options);
  };
};

const _isAvailable = (options = DEFAULT_OPTIONS) => {
  return async () => {
    let available = false;
    try {
      available = await FingerprintAIO.isAvailable();
      if (available === 'biometric' || available === 'finger' || available === 'face') return true;
      return false;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`Biometrics not available Error: ${err.message}`);
      return false;
    }
  };
};
