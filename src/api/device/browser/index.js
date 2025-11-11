import { Browser } from '@capacitor/browser';

const DEFAULT_OPTIONS = {
  presentationStyle: 'fullscreen',  // iOS only: The presentation style of the browser. Defaults to fullscreen.
  toolbarColor: '#151D28', // A hex color to set the toolbar color to.
  windowName: '_parent', // Web only: Optional target for browser open. Follows the `target` property for window.open. Defaults to _blank
  platform: 'browser',
};

const BrowserAPI = async (options = DEFAULT_OPTIONS) => {
  // Add code for database or API integrations

  return false;
};

export default BrowserAPI;

const _open = (options = DEFAULT_OPTIONS) => {
  // Add code for database or API integrations

  return false;
};

// Close an open browser. Only works on iOS and Web environment, otherwise is a no-op
const _close = (platform) => {
  // Add code for database or API integrations

  return false;
};
