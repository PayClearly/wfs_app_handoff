import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import md5 from 'md5';
import csvtojson from 'csvtojson';
import axios from 'axios';
import { Collapse } from 'react-collapse';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    tab: state.router.route.params.tab,
    policies: Selectors.entity('vendors_idOrganization_idAccount')(state),
    status: state.account.accountVendors.status,
    globalVendors: state.global.vendors.data.items || {},
    accountVendors: Selectors.accountVendors(state).all,
    access: state.user.access,
    erpIntegration: Selectors.integrations(state).erpIntegration,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createVendors: (data) => {
      dispatch(Store.account.createAccountVendors(data));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsAccountVendors());
    },
  });
};

// TODO this validate needs to match form validation from createVendor
const vendorCSVTemplate = {
  Name: 'Name',
  displayName: 'Display Name',
  check: 'Check',
  checkAddressLine1: 'Check Address Line1',
  checkAddressLine2: 'Check Address Line2',
  checkCity: 'Check City',
  checkStateProv: 'Check State Prov',
  checkPostalCode: 'Check Postal Code',
};

const defaultState = {
  newVendors: [],
  dropped: false,
  showCreatedNotification: false,
  showUploadNotification: false,
  successfullyCreated: false,
  noNewVendors: false,
  existingVendorIds: [],
};

class components_uploaders_accountvendor extends Component {
  state = {
    newVendors: [],
    existingVendorIds: [],
    dropzoneError: null,
    dropped: false,
    createFormActive: true,
    showUploadNotification: false,
    successfullyCreated: false,
  };

  componentDidMount() { }

  componentWillReceiveProps(nextProps = {}) {
    if (this.props.status.creating && !nextProps.status.creatingError && !nextProps.status.creating) {
      this.setState({ successfullyCreated: true });
    }
  }
  componentWillUnmount() { }

  onDrop = (acceptedFiles) => {
    // const vendors = [];
    acceptedFiles.forEach((acceptedFile) => {
      return axios.get(acceptedFile.preview)
        .then(({ data }) => {
          return Utils.csvToJson(data, vendorCSVTemplate)
            .then(({ parsedRows }) => {
              this.validateRows(parsedRows);
              this.uploadVendors(parsedRows);
              this.setState({ dropped: true });
            });
        })
        .catch((err) => {
          return this.setState({ uploadingError: err });
        });
    });
  };

  validateRows = (rowsArray) => {
    let errors = '';
    rowsArray.forEach((rowObject, rowNumber) => {
      Object.keys(rowObject).forEach((field) => {
        switch (field) {
          case 'Name':
            if (!rowObject[field].length) errors += `\nRow number ${rowNumber + 1}: ${field} is required.`;
            if (rowObject[field].length > 48) errors += `\nRow number ${rowNumber + 1}: ${field} must be less than 48 characters.`;
            break;
          case 'Display Name':
            if (rowObject[field].length > 48) errors += `\nRow number ${rowNumber + 1}: ${field} must be less than 48 characters.`;
            break;
          case 'Check':
            if (rowObject[field] && rowObject[field].toLowerCase() !== 'true' && rowObject[field].toLowerCase() !== 'false') errors += `\nRow number ${rowNumber + 1}: ${field} must be "", TRUE, or FALSE.`;
            break;
          case 'Check Address Line1':
            if (rowObject[field] && !rowObject['Check Address Line2'] && rowObject[field].length > 120) errors += `\nRow number ${rowNumber + 1}: ${field} must be less than 120 characters.`;
            if (rowObject[field] && rowObject['Check Address Line2'] && rowObject[field].length > 60) errors += `\nRow number ${rowNumber + 1}: ${field} must be less than 60 characters when also using "Check Address Line2".`;
            break;
          case 'Check Address Line2':
            if (rowObject[field] && !rowObject['Check Address Line1']) errors += `\nRow number ${rowNumber + 1}: ${field} cannot be used without also using "Check Address Line1".`;
            if (rowObject[field] && rowObject['Check Address Line1'] && rowObject[field].length > 60) errors += `\nRow number ${rowNumber + 1}: ${field} must be less than 60 characters.`;
            break;
          case 'Check City':
            if (rowObject[field].length > 48) errors += `\nRow number ${rowNumber + 1}: ${field} must be less than 48 characters.`;
            break;
          case 'Check Postal Code':
            if (rowObject[field] && !(/^[0-9]{5}(?:-[0-9]{4})?$/).test(rowObject[field])) errors += `\nRow number ${rowNumber + 1}: ${field} must be formatted 99999 or 99999-9999.`;
            break;
          default:
            break;
        }
      });
    });
    if (errors) throw new Error(errors);
  };

  getNewVendors = () => {
    return Object.keys(this.props.accountVendors)
      .filter(vendor => this.state.newVendors.includes(vendor))
      .reduce((newVendors, vendor) => {
        const toReturn = { ...newVendors };
        toReturn[vendor] = this.props.accountVendors[vendor];
        return toReturn;
      }, {});
  }

  uploadVendors = (uploadedVendors) => {
    const newVendors = [];
    const newVendorIds = [];
    const existingVendorIds = [];
    uploadedVendors.forEach((uploadedVendor) => {
      // stripp out unused fields
      if (!uploadedVendor.Name) return;
      const vendorKey = md5(uploadedVendor.Name);
      uploadedVendor.repEmails = uploadedVendor['Rep Contact Email'] && [uploadedVendor['Rep Contact Email']];
      delete uploadedVendor['Rep Contact Email'];
      if (this.props.accountVendors[vendorKey]) {
        existingVendorIds.push(vendorKey);
        return;
      }
      newVendorIds.push(vendorKey);

      const vendor = {};
      Object.keys(uploadedVendor).forEach((vendorField) => {
        if (uploadedVendor[vendorField] !== '') {
          // don't camelize if all caps. example: 'ACH'
          if (vendorField === vendorField.toUpperCase()) vendor[vendorField] = uploadedVendor[vendorField];
          else vendor[_camelize(vendorField)] = uploadedVendor[vendorField];
        }
      });
      newVendors.push(vendor);
    });
    if (newVendors.length) {
      const { globalVendors } = this.props;
      const newVendorsConvertedToVendorData = newVendors.map(newVendor => Utils.accountvendorformtovendor(newVendor, globalVendors));
      this.props.createVendors(newVendorsConvertedToVendorData);
      this.setState({
        newVendors: [...newVendorIds],
        showUploadNotification: true,
        existingVendorIds,
      });
    } else {
      this.setState({
        noNewVendors: true,
      });
    }
  };

  updateVendor = (currentKey) => {
    const newKey = md5(this.props.forms['Components.forms.accountvendor'][currentKey].name.value);
    const vendors = { ...this.state.vendors };

    vendors[newKey] = {
      ...this.props.forms['Components.forms.accountvendor'][currentKey]._values,
      allValid: this.props.forms['Components.forms.accountvendor'][currentKey]._allValid,
      formKey: newKey,
    };

    const selectedPaymentForm = this.props.forms[this.props.forms['Components.forms.accountvendor'][currentKey].selectedPaymentForm.value][currentKey];
    const paymentStrategies = {};
    paymentStrategies[selectedPaymentForm._id.value] = {
      ...selectedPaymentForm._values,
    };
    vendors[newKey].paymentStrategies = paymentStrategies;

    // name must be unique
    if (newKey !== currentKey) {
      delete vendors[currentKey];
    }

    this.setState({
      vendors,
    });
  };

  reset = () => this.setState(defaultState);

  renderNoNewVendorsError = () => (
    <div className="alert alert-warning" role="alert">
      <h4 className="alert-heading">Vendors Already Exist</h4>
      All of the vendors in the CSV file already exist, you may view or edit them below. Please feel free to upload another vendor file.
    </div>
  )

  render() {
    if (_try(() => this.props.erpIntegration.settings.createAccountVendorsFromERPVendors.default)) return null;

    const { status } = this.props;
    const { dropped, newVendors, noNewVendors, successfullyCreated, showUploadNotification, existingVendorIds, uploadingError } = this.state;

    const { creatingError: error, creating } = status;
    // const form = (this.props.forms['Components.forms.accountvendor'] && this.props.forms['Components.forms.accountvendor'].createVendor) || {};
    // const disabled = creating || form._allInitial || !form._allValid;
    const success = dropped && successfullyCreated;
    const numberNotReadyNewVendors = successfullyCreated ?
      newVendors.reduce((total, vendor) => {
        const accountVendor = this.props.accountVendors[vendor] || {};
        const notReady = (!accountVendor.readyToPay && (!accountVendor.linkedWithPayClearly || accountVendor.hasPSOP === 'yes')) ? 1 : 0;
        return total + notReady;
      }, 0)
      :
      null;

    return (
      <Fragment>
        {
          !dropped &&
          <Components.dropzone
            onDrop={this.onDrop}
            featureName="vendor"
            dropzoneError={uploadingError}
            csvFields={[[...Object.values(vendorCSVTemplate)]]}
            accept="text/csv,.csv"
            onClick={() => this.setState({ noNewVendors: false })}
            title="Vendors"
          />
        }
        {
          dropped && noNewVendors &&
          this.renderNoNewVendorsError()
        }
        {
          dropped && !!Object.keys(newVendors).length && !successfullyCreated && error &&
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            Error: {error}
            <br />
            <Components.button
              className="btn btn-danger mt-2"
              onClick={() => {
                if (error) this.props.clearStatusErrors();
                this.reset();
              }}
              buttonText="Try Again"
            />
          </div>
        }
        {
          dropped && !!Object.keys(newVendors).length && !successfullyCreated && !error &&
          <Components.spinner />
        }

        {
          dropped && !!Object.keys(newVendors).length && successfullyCreated && showUploadNotification &&
          <div className="alert alert-primary" role="alert">
            {`Vendor(s) successfully created! ${numberNotReadyNewVendors ? `We found ${numberNotReadyNewVendors} vendor${numberNotReadyNewVendors > 1 ? 's' : ''} that need${numberNotReadyNewVendors > 1 ? '' : 's'} attention before payments can be sent their way!` : 'All of your new vendors are ready to be paid!'} You can edit vendors below, or upload more vendors.`}
          </div>
        }
        {
          dropped && !!Object.keys(newVendors).length && (existingVendorIds.length > 0) &&
          <div className="alert alert-warning" role="alert">
            {`Some of the attempted uploaded vendors already exist in your account: ${existingVendorIds.map(vendor => this.props.accountVendors[vendor].name).join(', ')}. You can view or edit them in the Vendors table.`}
          </div>
        }
        {
          success && !!Object.keys(newVendors).length &&
          <div className="card mb-3">
            <div className="card-body">
              <Components.tables.accountvendor
                tableOnly
                vendors={this.getNewVendors()}
                sortBy="readyToPay"
              // updateVendor={this.props.updateVendor}
              />
            </div>
          </div>
        }

        {
          success &&
          <Fragment>
            {
              error &&
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Something Went Wrong</h4>
                Error: {error}
              </div>
            }
            {
              (numberNotReadyNewVendors > 0) &&
              <div className="alert alert-warning">
                {`Warning: ${numberNotReadyNewVendors} vendor${numberNotReadyNewVendors > 1 ? 's' : ''} require${numberNotReadyNewVendors > 1 ? '' : 's'} attention! Please update these vendors now, or skip and update later.`}
              </div>
            }
            <Components.button
              className="btn btn-primary me-3"
              onClick={this.reset}
              buttonText="Completed"
              disabled={numberNotReadyNewVendors}
            />
            <Components.button
              className="btn btn-secondary"
              onClick={this.reset}
              buttonText="Skip"
              disabled={!numberNotReadyNewVendors}
            />
          </Fragment>
        }

        {dropped && !success &&
          <Components.button
            className="btn btn-primary me-3"
            onClick={this.reset}
            buttonText="Reset"
          />
        }
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_uploaders_accountvendor);

// Internal Helper Functions ...
const _camelize = (str) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return '';
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
};

// GENERATOR_TYPE='component';
