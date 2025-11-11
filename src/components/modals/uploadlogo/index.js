import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import Cropper from 'react-cropper';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    organization: state.organization.data.id,
    organizations: state.organizations.data.items,
    organizationsStatus: state.organizations.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    uploadLogoToOrganization: (id, data) => {
      return dispatch(Store.organizations.update(id, data));
    },
    clearStatusErrors: () => {
      return dispatch(Store.organizations.clearErrors());
    },
  });
};

class components_modals_uploadlogo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photo: null,
      croppedPhoto: null,
      cropperHeight: this.props.cropperHeight || 200,
      outputWidth: this.props.outputWidth || 329,
      outputHeight: this.props.outputHeight || 151,
      errorMessage: null,
      crop: false,
    };
    this._crop = this._crop.bind(this);
    this._onCancelPhoto = this._onCancelPhoto.bind(this);
  }


  componentWillReceiveProps(nextProps) {
    if (this.props.organizationsStatus.updating && !nextProps.organizationsStatus.updating && !nextProps.organizationsStatus.updatingError) {
      this.props.close();
    }
  }
  componentWillUnmount() {
    if (this.props.organizationsStatus.updating || this.props.organizationsStatus.updatingError) {
      this.props.clearStatusErrors();
    }
  }

  onDrop = (files) => {
    if (files.length) {
      this.setState({ photo: files, crop: true, error: null, showError: false });
    } else {
      this.setState({ crop: false, photo: null, error: 'File not successfully dropped. Please verify that the file image is not larger than the maximum 10MB, and is a supported file type.', showError: true });
    }
  }

  submitLogo = () => {
    const organizationData = this.props.organizations && this.props.organizations[this.props.organization];
    const data = {
      name: organizationData.name,
      active: organizationData.active,
    };
    if (this.props.mode === 'dark') data.darkLogo = [this.croppedPhoto];
    else data.logo = [this.croppedPhoto];

    this.props.uploadLogoToOrganization(this.props.organization, data);
  }

  dataURItoFile = (dataURI) => {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    const byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    const ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (let i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    // changed to a File to preserve the filename metadata
    const blob = new File([ab], this.state.photo[0].name, { type: mimeString });
    return blob;
  }

  _crop() {
    if (this.cropper) {
      const url = this.cropper.getCroppedCanvas({ fillColor: this.state.photo[0].type.includes('png') ? 'transparent' : '#ffffff' }).toDataURL(this.state.photo[0].type);
      this.croppedPhoto = this.dataURItoFile(url);
    }
  }

  _onCancelPhoto(e) {
    e.preventDefault();
    this.setState({ photo: null, errorMessage: null, crop: false, showError: false });
  }

  render() {
    const { mode } = this.props;
    const { photo, cropperHeight, outputWidth, outputHeight } = this.state;
    const aspectRatio = outputWidth / outputHeight;

    const uploading = this.props.organizationsStatus.updating;
    const buttonsDisabled = uploading;
    const uploadDisabled = uploading || !this.state.photo;

    const title = mode === 'dark' ? 'Upload Dark Mode Logo' : 'Upload Logo';

    let errorMsg;
    if (uploadDisabled) {
      errorMsg = 'You must upload an image file';
    }
    if (this.state.error) {
      errorMsg = this.state.error;
    }

    return (
      <div className="modal-dialog wide-modal wide-70 components_modals_uploadlogo" role="document">
        <div className="modal-content h-100 w-100">
          <div className="modal-header">
            <h4 className="modal-title" id="exampleModalLabel">
              {title}
            </h4>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            <div className={'col-12'}>
              {this.state.crop ?
                <div>
                  <h3>Crop Image</h3>
                  <h5>Please crop image to desired size/position within aspect ratio window, or upload a different image file. A double-click will toggle between crop mode and move mode.</h5>
                  <Cropper
                    ref={(c) => { this.cropper = c; }}
                    src={photo[0].preview}
                    style={{ height: cropperHeight, width: '100%' }}
                    aspectRatio={aspectRatio}
                    guides
                    crop={this._crop}
                  />
                  <div className="mt-2">
                    <a href="#cancelPhoto" onClick={this._onCancelPhoto} className="btn btn-danger">Cancel</a>
                  </div>
                </div> :
                <Components.dropzone
                  accept={'image/jpeg, image/png'}
                  instructions={'Click to upload or drag and drop a supported file (.jpg, .jpeg or .png). We recommend images that have an aspect ratio of about 2:1.'}
                  onDrop={this.onDrop}
                  multiple={false}
                  maxSize={10000000}
                />
              }
            </div>
            {this.state.showError && errorMsg && <span className="text-danger"><i className="mdi mdi-alert-circle-outline text-danger" />&nbsp;{errorMsg}</span>}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={() => { if (buttonsDisabled) return; this.props.close(); }}
              disabled={false}
            >
              Close
            </button>
            <Components.button
              className="btn btn-primary"
              buttonText="Submit Logo"
              onClick={() => { if (buttonsDisabled || uploadDisabled) return; this.submitLogo(); }}
              onDisabledClick={() => this.setState({ showError: true })}
              ariaLabel="Submit Logo"
              updating={uploading}
              disabled={buttonsDisabled || uploadDisabled}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_uploadlogo);


