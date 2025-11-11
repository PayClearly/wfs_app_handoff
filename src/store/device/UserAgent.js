/* eslint no-underscore-dangle:0 */
/* eslint no-undef:0 */

export default {

  _getUserAgent/* istanbul ignore next */() { // eslint-disable-line no-inline-comments
    return window.navigator.userAgent;
  },

  _getMaxTouchPoints/* istanbul ignore next */() { // eslint-disable-line no-inline-comments
    return window.navigator.maxTouchPoints;
  },

  _getHasTouchStart/* istanbul ignore next */() { // eslint-disable-line no-inline-comments
    return ('ontouchstart' in window);
  },

  _isWindowOS() {
    const str = navigator.platform;
    return str.toLowerCase().indexOf('win') !== -1;
  },

  isIOSMobile() {
    return (this.isIPhone() || this.isIPod());
  },

  isIOSDevice() {
    return (this.isIPad() || this.isIPhone() || this.isIPod());
  },

  isIPad() {
    return Boolean(this._getUserAgent().match(/iPad/i));
  },

  isIPhone() {
    return Boolean(this._getUserAgent().match(/iPhone/i));
  },

  isIPod() {
    return Boolean(this._getUserAgent().match(/iPod/i));
  },

  isAndroidDevice() {
    return this._getUserAgent().toLowerCase().indexOf('android') > -1;
  },

  isWindowsMobile() {
    return Boolean(this._getUserAgent().match(/Windows Phone/i));
  },

  isTouchDevice() {
    return (this._getHasTouchStart() || this._getMaxTouchPoints()) &&
      (!this._isWindowOS() || this.isWindowsMobile());
  },

  getAllDeviceInformation() {
    return {
      isIOSMobile: this.isIOSMobile(),
      isIOSDevice: this.isIOSDevice(),
      isIPad: this.isIPad(),
      isIPhone: this.isIPhone(),
      isIPod: this.isIPod(),
      isAndroidDevice: this.isAndroidDevice(),
      isTouchDevice: this.isTouchDevice(),
    };
  },

};
