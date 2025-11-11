
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const DEFAULT_OPTIONS = {
  platform: 'browser',
  title: 'Camera Snapshot',
  subtitle: '',
  description: 'Take a photo or select from gallery',
};

const CameraAPI = async (options = DEFAULT_OPTIONS) => {
  return {
    takePhoto: _takePhoto(),
    choosePhoto: _choosePhoto(),
  };
};

export default CameraAPI;

// TODO :// Update this to only one function, if we don't pass source or do .Prompt then it will ask if take or choose photo
const _takePhoto = () => {
  return async () => {
    return Camera.getPhoto({
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      correctOrientation: true,
      source: CameraSource.Camera,
    });
  }
}

const _choosePhoto = () => {
  return async () => {
    return Camera.getPhoto({
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      correctOrientation: true,
      source: CameraSource.Photos,
    })
  }
}
