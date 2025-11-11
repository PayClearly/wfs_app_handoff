import { connect, Component, bindActionCreators, Fragment } from 'component';
import axios from 'axios';
import { Collapse } from 'react-collapse';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    loaded: _resolve(state, 'account.clientVendorLinks.status.fetched')
      && _resolve(state, 'account.clients.status.fetched')
      && _resolve(state, 'account.accountVendors.status.fetched')
      && _resolve(state, 'global.standardCredentialFields.status.fetched'),
    derivedForms: _try(() => Selectors.uploaders.clientVendorLinkForms()(state), {}),
    status: _resolve(state, 'account.clientVendorLinks.status', {}),
    uploadedFileNames: _resolve(state, 'account.clientVendorLinks.data.uploadedFileNames', []),
    standardCredentialFields: _resolve(state, 'global.standardCredentialFields.data.items', {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    create: (data, fileName) => {
      dispatch(Store.account.updateClientVendorLinks(data, fileName));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsClientVendorLinks());
    },
    openModal: () => {
      dispatch(Store.router.openModal('Components.modals.uploadingWait', { itemsDisplay: 'Client-Vendor Links' }));
    },
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

const templateMap = {
  // Every ClientVendorLink Needs
  'Vendor Name': 'vendorName',
  'Client Name': 'clientName',
};

const sanitizerMap = {
  vendorName: v => v.trim(),
  clientName: v => v.trim(),
};

class components_uploaders_clientVendorLinks extends Component {

  state = {
    fileName: null,
    uploaded: {},
    uploaderKey: '',
    initialUploaded: {},
    showCreatedNotification: false,
    sessionUploadCount: 0,
    maximumUpload: 300,
    tooLargeFile: false,
    uploadingError: '',
    uploadItemName: 'Client-Vendor Link',
    uploadItemNamePlural: 'Client-Vendor Links',
    templateMap,
    blurAll: false,
  }

  componentDidMount() {
    if (Object.keys(this.props.standardCredentialFields).length) {
      this.setState((prevState) => {
        return {
          templateMap: {
            ...prevState.templateMap,
            ...Object.keys(this.props.standardCredentialFields || {}).reduce((acc, cur) => { acc[this.props.standardCredentialFields[cur].name] = cur; return acc; }, {}),
          },
        };
      });
    }
  }
  componentWillReceiveProps(nextProps = {}) {
    if (this.props.status && !this.props.status.updatingError && nextProps.status.updatingError) {
      this.onCreate();
      this.props.closeModal();
    }

    if (this.props.status && this.props.status.updating && (!nextProps.status.updating && !nextProps.status.updatingError)) {
      if (typeof this.onCreate === 'function') {
        this.onCreate();
        this.setState({ showCreatedNotification: true, disabledClick: false });
        this.props.closeModal();
      }
    }

    if (Object.keys(this.props.standardCredentialFields).length !== Object.keys(nextProps.standardCredentialFields).length) {
      this.setState((prevState) => {
        return {
          templateMap: {
            ...prevState.templateMap,
            ...Object.keys(nextProps.standardCredentialFields || {}).reduce((acc, cur) => { acc[nextProps.standardCredentialFields[cur].name] = cur; return acc; }, {}),
          },
        };
      });
    }
  }


  onCreate = () => {
    this.setState({
      uploaded: {},
      uploaderKey: '',
      sessionUploadCount: 0,
      initialUploaded: {},
      fileName: null,
      blurAll: false,
    });
  }

  onDrop = (acceptedFiles) => {
    const uploaderKey = Date.now();
    this.setState({ uploadingError: '' });
    const template = this.state.templateMap;
    return _parseDroppedFileData(acceptedFiles[0], this.rowAdapter, template, 'id', uploaderKey)
      .then((data = []) => {
        const sessionUploadCount = Object.keys(data || {}).length;
        if (sessionUploadCount > this.state.maximumUpload) {
          this.setState({ tooLargeFile: true });
          return;
        }
        this.setState({
          fileName: acceptedFiles[0].name,
          uploaderKey,
          uploaded: data,
          sessionUploadCount,
          initialUploaded: data,
          showCreatedNotification: false,
          tooLargeFile: false,
        });
      })
      .catch((err) => {
        this.setState({ uploadingError: err });
      });
  }

  onSubmit = () => {
    const aggregateFormState = _aggregateFormData(this.props.derivedForms, this.state.uploaded);
    this.props.create(aggregateFormState.adapted, this.state.fileName);
    this.props.openModal();
  }

  onAdd = () => {
    this.setState({ showCreatedNotification: false }, () => {
      this.addItem();
    });
  }

  rowAdapter = (row, index, uploaderKey) => {
    const rowData = Object.keys(row)
      .reduce((acc, columnName) => {
        const key = this.state.templateMap[columnName];
        const value = sanitizerMap[key] ? sanitizerMap[key](row[columnName]) : row[columnName];

        if (key) {
          acc[key] = value;
          acc.credentials = {
            ...acc.credentials,
            [key]: value,
          };
        } else {
          acc.credentials = {
            ...acc.credentials,
            [columnName]: value,
          };
        }

        return acc;
      }, { credentials: {}, id: `${uploaderKey}_clientVendorLinksUploader_${index}` });
    return rowData;
  }

  addItem = () => {
    const newClientVendorLink = this.rowAdapter({}, this.state.sessionUploadCount, this.state.uploaderKey);

    this.setState((prevState) => {
      const newUploaded = { ...prevState.uploaded };
      newUploaded[newClientVendorLink.id] = newClientVendorLink;

      return {
        uploaded: newUploaded,
        sessionUploadCount: prevState.sessionUploadCount + 1,
      };
    });
    return newClientVendorLink.id;
  }

  render() {
    const { loaded } = this.props;

    // Waits until statuses are fetched
    if (!loaded) return <Components.spinner />;

    const aggregateFormState = _aggregateFormData(this.props.derivedForms, this.state.uploaded);
    const { tooLargeFile } = this.state;
    const { updating, updatingError } = this.props.status;

    return (
      <div className="components_uploaders_clientVendorLinks">
        <Collapse isOpened={this.props.uploadedFileNames.some(fileName => fileName === this.state.fileName)}>
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">Warning</h4>
            We see that the file you uploaded has the same name as a previously uploaded file. If you are doing this because you experienced an error on your last upload, <b>be advised that some of your {this.state.uploadItemNamePlural} from your last upload may already be created.</b> Please double check to make sure you are not reuploading any of the successfully created {this.state.uploadItemNamePlural} to avoid creating duplicate {this.state.uploadItemNamePlural}.
          </div>
        </Collapse>
        {!Object.keys(this.state.uploaded).length ?
          <Components.dropzone
            uploadAndCreate
            add={this.onAdd}
            instructions={<h5>Upload a supported <b>csv</b> file or start creating your {this.state.uploadItemNamePlural} manually</h5>}
            onDrop={this.onDrop}
            dropzoneError={this.state.uploadingError}
            featureName="client-vendor-links"
            accept="text/csv,.csv"
            csvFields={[[...Object.keys(this.state.templateMap)]]}
          />
          :
          <Fragment>
            <div className="card">
              <Components.uploaders.components.tables.clientVendorLinksPreview
                items={this.state.uploaded}
                initialUploaded={this.state.initialUploaded}
                remove={(id) => {
                  const uploaded = { ...this.state.uploaded };
                  delete uploaded[id];
                  this.setState({ uploaded });
                }}
                tableActionButtons={[{
                  text: 'Add Client-Vendor Link',
                  icon: 'mdi-plus-circle',
                  iconColor: 'text-primary',
                  action: this.addItem,
                }]}
                blurAll={this.state.blurAll}
              />
            </div>
            <Components.button
              buttonText="Submit"
              onClick={this.onSubmit}
              onDisabledClick={() => { this.setState({ blurAll: true }); }}
              ariaLabel="Submit Client-Vendor Links"
              className="btn btn-primary mt-4 me-3 submit-button"
              updating={updating}
              disabled={!Object.keys(this.state.uploaded).length || updating || !aggregateFormState.valid}
            />
            <Components.button
              className="btn btn-secondary mt-4"
              onClick={() => {
                this.props.clearStatusErrors();
                this.setState({ uploaded: {}, disabledClick: false, sessionUploadCount: 0, uploaderKey: '', fileName: null, blurAll: false });
              }}
              buttonText="Reset"
            />
          </Fragment>
        }
        <Collapse isOpened={!!updatingError}>
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            {`There was a problem creating your ${this.state.uploadItemNamePlural}: ${updatingError}. Some of the ${this.state.uploadItemNamePlural} may have been successfully created. Please adjust your csv and try again.`}
          </div>
        </Collapse>
        <Collapse isOpened={tooLargeFile}>
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            {`File exceeds the maximum limit. Please limit your file to ${this.state.maximumUpload} ${this.state.uploadItemNamePlural} and try again.`}
          </div>
        </Collapse>
        {/* {!aggregateFormState.valid && !!_try(() => aggregateFormState.duplicateNameInUpload) &&
          <Fragment>
            <div className="alert alert-warning mt-3 mb-0" role="alert">
              <h4 className="alert-heading">Clients With Duplicate Names</h4>
              <div className="row align-items-center">
                <div className="col-xs-12 col-md-8 mt-1 mb-1">
                  At least two clients in this upload have identical names. Client names must be unique. Please update this upload accordingly.
                </div>
              </div>
            </div>
          </Fragment>
        } */}
        {this.state.showCreatedNotification ?
          <div className="alert alert-primary" role="alert">
            <div className="row align-items-center">
              <div className="col-12 mt-1 mb-1">
                {Utils.capitalize(this.state.uploadItemNamePlural)} successfully created! See details in the {this.state.uploadItemNamePlural} table, or create additional {this.state.uploadItemNamePlural}.
              </div>
            </div>
          </div>
          : null
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_uploaders_clientVendorLinks);

// Internal Helper Functions ...
function _parseDroppedFileData(acceptedFile, adapter, template, idKey, uploaderKey) {
  return new Promise((resolve, reject) => {
    return axios.get(acceptedFile.preview)
      .then(({ data }) => {
        return Utils.csvToJson(data, template)
          .then(({ parsedRows }) => {
            resolve(Object.values(parsedRows)
              .map((item, index) => {
                return adapter(item, index, uploaderKey);
              })
              .reduce((acc, curr) => {
                return {
                  ...acc,
                  [curr[idKey]]: curr,
                };
              }, {}));
          });
      })
      .catch(reject);
  });
}

function _aggregateFormData(derivedForms, uploaded) {
  return Object.keys(uploaded || {})
    // .filter(key => !uploaded[key].removed)
    .reduce((acc, formId) => {
      const derived = derivedForms[formId];
      if (!derived) return acc;

      // const duplicateNameInUpload = Object.keys(derivedForms).some((derivedFormId) => {
      //   return derivedFormId !== formId && _try(() => derivedForms[derivedFormId].adapted.name) && _try(() => derived.adapted.name) && derivedForms[derivedFormId].adapted.name === derived.adapted.name;
      // });

      let category;
      if (!derived.valid) {
        category = 'notReady';
      } else {
        category = 'ready';
      }

      acc.counts.total += 1;
      acc.counts[category] += 1;

      return {
        ...acc,
        valid: acc.valid && derived.valid,
        adapted: [...acc.adapted, ...[derived.adapted]],
      };
    }, {
      valid: true,
      counts: {
        ready: 0,
        notReady: 0,
        total: 0,
      },
      adapted: [], // the data that can be used to create the clientVendorLinks
    });
}

// GENERATOR_TYPE='component';
