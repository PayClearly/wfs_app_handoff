import { connect, Component } from 'component';

// Third Party Imports ...
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import { CSVLink } from 'react-csv';
import { Collapse } from 'react-collapse';

import Components from 'components';

import './index.scss';

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

class componentsDropzone extends Component {
  state = {
    dropzoneActive: false,
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.dropzoneError !== nextProps.dropzoneError) {
      this.setState({ dropzoneError: nextProps.dropzoneError });
    }
  }

  getCreateDisplayName = () => {
    const featureNameToDisplayNameMap = {
      'purchase-card': 'Purchase Card',
      payment: 'Payment',
      clients: 'Client',
      'client-vendor-links': 'Client-Vendor Link',
      'plastic-card': 'Plastic Card',
      'bulk-vendors': 'Bulk Vendors',
    };

    return featureNameToDisplayNameMap[this.props.featureName] || 'Item';
  };

  renderFilePreview() {
    return this.props.acceptedFiles.map((file) => {
      if (file.type.includes('pdf')) {
        return (
          <Components.containers.pdf
            file={file}
            hidePagination
          />
        );
      }
      return (
        <li
          className={`media${this.props.fullSizeImagePreviews
            ? ' d-flex flex-column-reverse align-items-center'
            : ''}`}
          key={file.name}
        >
          {(() => {
            if (file.type.includes('image')) {
              return (
                <img
                  className={'d-flex me-3'}
                  rc={file.preview}
                  width={`${this.props.fullSizeImagePreviews ? '80%' : '60'}`}
                  alt={`file preview ${file.name}`}
                />
              );
            }
            return (
              <Components.mimeicon
                contentType={file.type}
              />
            );
          })()}
          <div className={`media-body${this.props.fullSizeImagePreviews ? ' text-center mb-2' : ''}`}>
            <h5 className={'mt-0 mb-1'}>{file.name}</h5>
            {file.size} bytes
            {this.props.fullSizeImagePreviews && <hr />}
          </div>
        </li>
      );
    });
  }

  render() {
    return (
      <section className="components_dropzone">
        <Collapse isOpened={this.state.dropzoneError}>
          <div className="alert alert-danger" role="alert" style={{ whiteSpace: 'pre-line' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4 className="alert-heading">Warning</h4>
              <span style={{ cursor: 'pointer' }} onClick={() => this.setState({ dropzoneError: '' })}>x</span>
            </div>
            {`Oops! Looks like something went wrong: ${this.state.dropzoneError}`}
          </div>
        </Collapse>
        {this.props.title ? <h3>{this.props.title || 'Upload A File'}</h3> : null}
        {this.props.instructions || <h5>Click or drag and drop to upload a supported <b>.csv</b> file </h5>}
        {this.props.uploadAndCreate
          ? (
            <div
              role="tooltip"
              style={{ width: '100%' }}
              className={'d-flex justify-content-center action-button-uploader no-select'}
              onClick={this.props.add}
            >
              <i className={'mdi mdi-plus-circle me-2'} />
              <span>{`Create a ${this.getCreateDisplayName()}`}</span>
            </div>
          )
          : null}

        <Dropzone
          onDrop={(files) => { this.props.onDrop(files); }}
          onDragEnter={() => { this.setState({ dropzoneActive: true }); }}
          onDragLeave={() => { this.setState({ dropzoneActive: false }); }}
          accept={this.props.accept || 'text/csv'}
          className={classNames('dropzone', { active: this.state.dropzoneActive }, 'mb-4')}
          onClick={(this.props.onClick && typeof this.props.onClick === 'function') ? this.props.onClick : null}
          multiple={this.props.multiple === false ? this.props.multiple : true}
          maxSize={this.props.maxSize || Infinity}
        >
          {(() => {
            if (this.props.acceptedFiles?.length) {
              return (
                <div className="card-body">
                  <h4>Files to upload</h4>
                  <ul className={'list-unstyled'}>
                    {this.renderFilePreview()}
                  </ul>
                </div>
              );
            }
            return (
              <div className="upload-message">
                <span className="mdi mdi-cloud-upload">
                  <p>Drop Files Here to Upload</p>
                  {this.props.csvFields && <div className="download-box" />}
                </span>
              </div>
            );
          })()}
        </Dropzone>
        {
          this.props.csvFields
          && (
            <div className="download">
              <CSVLink
                data={this.props.csvFields}
                filename={`wfs-${this.props.featureName || 'vendor'}-template.csv`}
                target="_blank"
              >
                <span className="mdi mdi-cloud-download mb-4"> Download The Template</span>
              </CSVLink>
            </div>
          )
        }
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsDropzone);
