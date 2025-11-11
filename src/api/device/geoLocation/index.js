import { Geolocation } from '@capacitor/geolocation';

const DEFAULT_OPTIONS = {
  platform: 'browser',
  title: 'Geolocation Access',
  subtitle: '',
  description: 'Get current position of user',
  options: {
    enableHighAccuracy: true,
  },
};

const GeolocationAPI = async (options = DEFAULT_OPTIONS) => {
  return {
    getCurrentLocation: _getCurrentLocation(options.options),
  };
};

export default GeolocationAPI;

const _getCurrentLocation = (options) => {
  return async () => {
    return Geolocation.getCurrentPosition(options);
  };
};
