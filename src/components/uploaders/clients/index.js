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
    loaded: _resolve(state, 'account.clients.status.fetched'),
    derivedForms: _try(() => Selectors.uploaders.clientForms()(state), {}),
    status: _resolve(state, 'account.clients.status', {}),
    uploadedFileNames: _resolve(state, 'account.clients.data.uploadedFileNames', []),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    create: (data, fileName) => {
      dispatch(Store.account.createClients(data, fileName));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsClients());
    },
    openModal: () => {
      dispatch(Store.router.openModal('Components.modals.uploadingWait', { itemsDisplay: 'Clients' }));
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
  // Every Client Needs
  Name: 'name',

  // Every Client Can
  'Display Name': 'displayName',
  'Contact Name': 'contactName',
  'Contact Email': 'contactEmail',
};

const sanitizerMap = {
  name: v => v.trim(),
  displayName: v => v.trim(),
  contactName: v => v.trim(),
  contactEmail: v => v.trim(),
};

class components_uploaders_clients extends Component {

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
    uploadItemName: 'client',
    uploadItemNamePlural: 'clients',
    blurAll: false,
  }


  componentWillReceiveProps(nextProps = {}) {
    if (this.props.status && !this.props.status.creatingError && nextProps.status.creatingError) {
      this.onCreate();
      this.props.closeModal();
    }

    if (this.props.status && this.props.status.creating && (!nextProps.status.creating && !nextProps.status.creatingError)) {
      if (typeof this.onCreate === 'function') {
        this.onCreate();
        this.setState({ showCreatedNotification: true, disabledClick: false });
        this.props.closeModal();
      }
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
    const template = templateMap;
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
        const key = templateMap[columnName];
        const value = sanitizerMap[key] ? sanitizerMap[key](row[columnName]) : row[columnName];

        if (key) {
          acc[key] = value;
          acc.fields = {
            ...acc.fields,
            [key]: value,
          };
        } else {
          acc.fields = {
            ...acc.fields,
            [columnName]: value,
          };
        }

        return acc;
      }, { fields: {}, id: `${uploaderKey}_clientsUploader_${index}` });
    return rowData;
  }

  addItem = () => {
    const newClient = this.rowAdapter({}, this.state.sessionUploadCount, this.state.uploaderKey);

    this.setState((prevState) => {
      const newUploaded = { ...prevState.uploaded };
      newUploaded[newClient.id] = newClient;

      return {
        uploaded: newUploaded,
        sessionUploadCount: prevState.sessionUploadCount + 1,
      };
    });
    return newClient.id;
  }

  render() {
    const { loaded } = this.props;

    // Waits until statuses are fetched
    if (!loaded) return <Components.spinner />;

    const aggregateFormState = _aggregateFormData(this.props.derivedForms, this.state.uploaded);
    const { tooLargeFile } = this.state;
    const { creating, creatingError } = this.props.status;

    return (
      <div className="components_uploaders_clients">
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
            featureName="clients"
            accept="text/csv,.csv"
            csvFields={[[...Object.keys(templateMap), ...Object.keys(this.props.paymentCardCustomFields || {})]]}
          />
          :
          <Fragment>
            <div className="card">
              <Components.uploaders.components.tables.clientsPreview
                items={this.state.uploaded}
                initialUploaded={this.state.initialUploaded}
                duplicateNamesUsedInUpload={aggregateFormState.duplicateNamesUsedInUpload}
                remove={(id) => {
                  const uploaded = { ...this.state.uploaded };
                  delete uploaded[id];
                  this.setState({ uploaded });
                }}
                tableActionButtons={[{
                  text: 'Add Client',
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
              ariaLabel="Submit Clients"
              className="btn btn-primary mt-4 me-3 submit-button"
              updating={creating}
              disabled={!Object.keys(this.state.uploaded).length || creating || !aggregateFormState.valid}
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
        <Collapse isOpened={!!creatingError}>
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            {`There was a problem creating your ${this.state.uploadItemNamePlural}: ${creatingError}. Some of the ${this.state.uploadItemNamePlural} may have been successfully created. Please adjust your csv and try again.`}
          </div>
        </Collapse>
        <Collapse isOpened={tooLargeFile}>
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            {`File exceeds the maximum limit. Please limit your file to ${this.state.maximumUpload} ${this.state.uploadItemNamePlural} and try again.`}
          </div>
        </Collapse>
        {!aggregateFormState.valid && !!_try(() => aggregateFormState.duplicateNameInUpload) &&
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
        }
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

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_uploaders_clients);

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

      const duplicateNameInUpload = Object.keys(derivedForms).some((derivedFormId) => {
        return derivedFormId !== formId && _try(() => derivedForms[derivedFormId].adapted.name) && _try(() => derived.adapted.name) && derivedForms[derivedFormId].adapted.name === derived.adapted.name;
      });
      if (duplicateNameInUpload && !acc.duplicateNamesUsedInUpload[derived.adapted.name]) acc.duplicateNamesUsedInUpload[derived.adapted.name] = true;

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
        valid: acc.valid && derived.valid && !duplicateNameInUpload,
        adapted: [...acc.adapted, ...[derived.adapted]],
        duplicateNameInUpload: acc.duplicateNameInUpload || duplicateNameInUpload, // set new value if acc has false, otherwise keep true once set to true
      };
    }, {
      valid: true,
      counts: {
        ready: 0,
        notReady: 0,
        total: 0,
      },
      adapted: [], // the data that can be used to create the clients
      duplicateNameInUpload: false,
      duplicateNamesUsedInUpload: {},
    });
}

// GENERATOR_TYPE='component';
