import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import Cropper from 'react-cropper';
import classNames from 'classnames';

import Components from 'components';

import './index.scss';

/**

 * Usage:

 * <PhotoUploader

 *  onSavePhoto={(img) => { console.log(img); }}

 *  onError={(error) => { console.log(error); }}

 *  outputWidth={200}

 *  outputHeight={200}

 *  cropperHeight={300}

 *  src={}

 *  iconClassName="mdi-face-profile"

 * />

 */

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_photouploader extends Component {

  constructor(props) {
    super(props);
    this.state = {
      photo: null,
      croppedPhoto: null,
      cropperHeight: this.props.cropperHeight || 300,
      outputWidth: this.props.outputWidth || 200,
      outputHeight: this.props.outputHeight || 200,
      errorMessage: null,
    };
    this._crop = this._crop.bind(this);
    this._selectPhoto = this._selectPhoto.bind(this);
    this._onSavePhoto = this._onSavePhoto.bind(this);
    this._handleError = this._handleError.bind(this);
    this._onCancelPhoto = this._onCancelPhoto.bind(this);
    this._onRemovePhoto = this._onRemovePhoto.bind(this);
  }

  state = {}

  componentWillReceiveProps(nextProps = {}) {
    if (this.props.accountId && (this.props.accountId !== nextProps.accountId)) {
      this.setState({ croppedPhoto: null, photo: null, errorMessage: null });
    }
  }

  _getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => { return resolve(reader.result); };
      reader.onerror = (error) => { return reject(error); };
    });
  }

  _handleError(errorMessage) {
    this.setState({ errorMessage }, () => {
      if (typeof this.props.onError === 'function') {
        this.props.onError(errorMessage);
      }
    });
  }

  _isValidPhoto(file) {
    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    if (!allowedExtensions.exec(file.name)) {
      this._handleError('Unsupported file type. Try to upload an different image file');
      return false;
    }
    const fileSize = (file.size / 1024).toFixed(2);
    if (fileSize > 500) {
      this._handleError('File size cannot be more than 500KB. Try to upload a smaller size image file');
      return false;
    }
    return true;
  }

  _selectPhoto(e) {
    console.log(this);
    const file = e.target.files[0];
    if (this._isValidPhoto(file)) {
      this._getBase64(file).then((photo) => {
        this.setState({ photo, errorMessage: null });
      }).catch((error) => {
        this._handleError(error);
      });
    }
  }

  _crop() {
    if (this.cropper) {
      this.croppedPhoto = this.cropper.getCroppedCanvas({ width: this.state.outputWidth, height: this.state.outputHeight }).toDataURL();
    }
  }

  _onSavePhoto(e) {
    e.preventDefault();
    const { onSavePhoto } = this.props;
    this.setState({ croppedPhoto: this.croppedPhoto, photo: null }, () => {
      if (typeof onSavePhoto === 'function') {
        onSavePhoto(this.croppedPhoto);
      }
    });
  }

  _onCancelPhoto(e) {
    e.preventDefault();
    this.setState({ photo: null, errorMessage: null });
  }

  _onRemovePhoto(e) {
    e.preventDefault();
    const { onSavePhoto } = this.props;
    this.setState({ croppedPhoto: null, photo: null, errorMessage: null });
    if (typeof onSavePhoto === 'function') {
      onSavePhoto(null);
    }
  }

  render() {
    const { photo, croppedPhoto, cropperHeight, outputWidth, outputHeight, errorMessage } = this.state;
    const { src, iconClassName } = this.props;
    const aspectRatio = outputWidth / outputHeight;
    const noPhotoIcon = classNames('mdi', iconClassName || 'mdi-face-profile');
    const message = croppedPhoto || src ?
      (<a href="#removePhoto" className="mdi mdi-delete-forever btn-sm btn-outline-danger" onClick={this._onRemovePhoto}>Remove</a>) :
      (<span className="mdi mdi-cloud-upload">&nbsp;Upload</span>);
    return (
      <div className="components_photouploader">
        {photo ?
          <div>
            <Cropper
              ref={(c) => { this.cropper = c; }}
              src={photo}
              style={{ height: cropperHeight, width: '100%' }}
              aspectRatio={aspectRatio}
              guides
              crop={this._crop}
            />
            <div className="mt-2">
              <a href="#savePhoto" onClick={this._onSavePhoto} className="btn btn-primary">Save Photo</a>
              <a href="#cancelPhoto" onClick={this._onCancelPhoto} className="btn btn-secondary ms-2">Cancel</a>
            </div>
          </div> :
          <div className="text-center d-inline-block">
            <label className="photoHolder" htmlFor="fileUpload">
              {(() => {
                if (croppedPhoto || src) return (<img src={croppedPhoto || src} alt="Cropped" width={outputWidth} height={outputHeight} />);
                if (this.props.uid) return (<Components.avatar user={{ _id: this.props.uid }} width={120} />);
                return <div className="blank" style={{ width: outputWidth }}><span href="#photo" className={noPhotoIcon} /></div>;
              })()}
              <input id="fileUpload" type="file" onChange={this._selectPhoto} accept="image" />
              <div style={{ width: outputWidth }}>
                {
                  errorMessage ?
                    <span className="text-danger small">{errorMessage}</span> :
                    <span>{message}</span>
                }
              </div>
            </label>
          </div>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_photouploader);

