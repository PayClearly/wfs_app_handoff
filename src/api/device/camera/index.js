
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const DEFAULT_OPTIONS = {
  platform: 'browser',
  title: 'Camera Snapshot',
  subtitle: '',
  description: 'Take a photo or select from gallery',
};

const CameraAPI = async (options = DEFAULT_OPTIONS) => {
  // Add code for database or API integrations

  return false;
};

export default CameraAPI;

// TODO :// Update this to only one function, if we don't pass source or do .Prompt then it will ask if take or choose photo
const _takePhoto = () => {
  // Add code for database or API integrations

  return false;
}

const _choosePhoto = () => {
  // Add code for database or API integrations

  return false;
}
