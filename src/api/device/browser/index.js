import { Browser } from '@capacitor/browser';

const DEFAULT_OPTIONS = {
  presentationStyle: 'fullscreen',  // iOS only: The presentation style of the browser. Defaults to fullscreen.
  toolbarColor: '#151D28', // A hex color to set the toolbar color to.
  windowName: '_parent', // Web only: Optional target for browser open. Follows the `target` property for window.open. Defaults to _blank
  platform: 'browser',
};

const BrowserAPI = async (options = DEFAULT_OPTIONS) => {
  return {
    open: _open(options),
    close: _close(options.platform),
  };
};

export default BrowserAPI;

const _open = (options = DEFAULT_OPTIONS) => {
    return (url, opts = {}) => {

    if (opts.browserFinished) {
      Browser.addListener('browserFinished', () => {
        Browser.removeAllListeners();
        return opts.browserFinished();
      });
    }

    if (opts.browserPageLoaded) {
      Browser.addListener('browserPageLoaded', () => {
        Browser.removeAllListeners();
        opts.browserPageLoaded();
      });
    }

    return Browser.open({
      url,
      presentationStyle: options.presentationStyle || DEFAULT_OPTIONS.presentationStyle,
      toolbarColor: options.toolbarColor || DEFAULT_OPTIONS.toolbarColor,
      windowName: options.windowName || DEFAULT_OPTIONS.windowName,
    });
  };
};

// Close an open browser. Only works on iOS and Web environment, otherwise is a no-op
const _close = (platform) => {
  return () => {
    if (platform.toLowerCase() === 'android') return Promise.resolve();
    return Browser.close();
  };
};
