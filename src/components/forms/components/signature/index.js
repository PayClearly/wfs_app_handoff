import { connect, Component } from 'component';

// Third Party Imports ...
import classNames from 'classnames';
import SignatureCanvas from 'react-signature-canvas';
import Dimensions from 'react-dimensions';
import Cropper from 'react-cropper';

import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_forms_components_signature extends Component {
  state = {
    uploadedPhoto: null,
  };

  onCancelPhoto = (e) => {
    e.preventDefault();
    this.setState({ uploadedPhoto: null, errorMessage: null });
  };

  onSavePhoto = (e) => {
    e.preventDefault();
    this.setState({ uploadedPhoto: null, errorMessage: null, file: null });
    this.signaturePadRef.fromDataURL(this.croppedPhoto, {
      width: this.props.containerWidth,
      height: this.props.containerHeight,
      ratio: this.props.containerWidth / this.props.containerHeight,
    });
    setTimeout(() => {
      this.props.action('change', this.props.field, this.signaturePadRef.getTrimmedCanvas().toDataURL('image/jpeg'));
    });
  };

  _getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  uploadSignaturePhoto = (e) => {
    const file = e.target.files[0];

    if (this._isValidPhoto(file)) {
      this._getBase64(file).then((uploadedPhoto) => {
        this.setState({ uploadedPhoto, errorMessage: null, file });
      }).catch((error) => {
        this._handleError(error);
      });
    }
  };

  clearCanvas = (e) => {
    e.preventDefault();
    this.signaturePadRef.clear();
    this.props.action('change', this.props.field, '');
    return this.signatureInputRef.focus();
  };

  captureSignature = () => {
    this.props.action('blur', this.props.field);
    this.props.action('change', this.props.field, this.signaturePadRef.getTrimmedCanvas().toDataURL('image/png'));
    return this.signatureInputRef.focus();
  };

  _crop = () => {
    if (this.cropper) {
      this.croppedPhoto = this.cropper.getCroppedCanvas({
        width: this.props.containerWidth,
        height: this.props.containerHeight,
      }).toDataURL();
    }
  };

  _isValidPhoto(file) {
    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif|\.bmp)$/i;
    if (!allowedExtensions.exec(file.name)) {
      this._handleError('Unsupported file type. Try to upload an different image file');
      return false;
    }
    return true;
  }

  render() {
    const { form, hidden } = this.props;
    const field = form[this.props.field];

    if (!field || hidden) { return null; }

    return (
      <div className="components_forms_components_signature">
        <div className={classNames({ hidden: !this.state.uploadedPhoto })}>
          <Cropper
            ref={(cropper) => { this.cropper = cropper; }}
            src={this.state.uploadedPhoto}
            style={{ height: this.props.containerHeight, width: this.props.containerWidth }}
            aspectRatio={this.props.containerWidth / this.props.containerHeight}
            guides
            crop={this._crop}
          />
        </div>
        <div
          className={classNames('form-group', {
            'has-error': (field.error && !this.props.hideError),
          }, {
            hidden: this.state.uploadedPhoto,
          })}
        >
          <input
            id={'signature-pad'}
            type={'text'}
            style={{
              height: 0, width: 0, 'min-height': 0, position: 'absolute',
            }}
            className={'input-sm form-control'}
            ref={(input) => { this.signatureInputRef = input; }}
            value={field.value}
            disabled={this.props.disabled || false}
            required
          />
          <SignatureCanvas
            type={this.props.type}
            ref={(ref) => { this.signaturePadRef = ref; }}
            canvasProps={{
              width: this.props.containerWidth,
              height: this.props.containerHeight,
              className: 'signature-pad',
            }}
            backgroundColor={'rgb(255, 255, 255)'}
            onEnd={this.captureSignature}
            onBegin={() => { this.signatureInputRef.focus(); }}
          />
          <span className="bar" />
          {this.props.label && (
            <label
              htmlFor={'signature-pad'}
              className={classNames({
                required: this.props.required,
                isFloating: Boolean(field.value),
              })}
            >
              {this.props.label}
            </label>
          )}
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="help-block">
              {this.props.hideError && this.props.placeholder ? `${this.props.placeholder}` : ''}
            </small>
            <small className="help-block">
              {(!field.error || this.props.hideError)
                && this.props.detailedInformation
                && !this.props.placeholder
                ? `${this.props.detailedInformation}`
                : ''}
            </small>
            <small className="fieldError text-danger">
              {(field.error && !this.props.hideError) ? field.error : '\u00A0'}
            </small>
          </div>
          <div>
            {
              this.state.uploadedPhoto
                ? (
                  <>
                    <button
                      onClick={this.onSavePhoto}
                      className="btn btn-xs btn-outline-primary mt-1"
                    >Save Photo
                    </button>
                    <button
                      type="button"
                      onClick={this.onCancelPhoto}
                      className="btn btn-xs btn-outline-secondary ms-2 mt-1"
                    >Cancel Upload
                    </button>
                  </>
                ) : (
                  <>
                    <small><i className="mdi mdi-alert-circle-outline me-1" />Please draw or upload signature</small>
                    <input
                      id={'signatureUpload'}
                      type="file"
                      style={{ display: 'none' }}
                      onChange={this.uploadSignaturePhoto}
                      accept="image"
                    />
                    <label
                      id={'signature-label'}
                      htmlFor={'signatureUpload'}
                      className={'btn btn-xs btn-outline-primary ms-2'}
                    >
                      Upload Image
                    </label>
                    <button
                      type="button"
                      className={'btn btn-xs btn-outline-secondary ms-2'}
                      onClick={(e) => { this.clearCanvas(e); }}
                    >Clear Signature
                    </button>
                  </>
                )
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dimensions()(components_forms_components_signature));
