import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    vendor: state.account.accountVendors.data.items[props.id] || {},
    status: state.account.validatedAddress.status,
    accountVendorStatus: state.account.accountVendors.status,
    validatedAddress: _resolve(state, 'account.validatedAddress.data.item'),
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    validateAddress: (vendor) => {
      return dispatch(Store.account.validateAccountVendorAddress(vendor));
    },
    clearAddress: (vendor) => {
      return dispatch(Store.account.clearValidatedAddress(vendor));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsAccountVendors());
    },
    updateAccountVendor: (data) => {
      return dispatch(Store.account.updateAccountVendor(data));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_modals_addressValidator extends Component {

  state = {}

  componentDidMount() {
    return this.props.validateAddress(this.props.vendor);
  }
  componentWillReceiveProps(nextProps = {}) {
    const addressHasChanged = this.props.vendor.checkAddressLine1 !== nextProps.vendor.checkAddressLine1 ||
      this.props.vendor.checkAddressLine2 !== nextProps.vendor.checkAddressLine2 ||
      this.props.vendor.checkCity !== nextProps.vendor.checkCity ||
      this.props.vendor.checkStateProv !== nextProps.vendor.checkStateProv ||
      this.props.vendor.checkPostalCode !== nextProps.vendor.checkPostalCode ||
      this.props.vendor.checkCountry !== nextProps.vendor.checkCountry;
    if (addressHasChanged && !this.state.acceptedValidation) {
      this.props.clearAddress();
      return this.props.validateAddress(nextProps.vendor);
    }

    if (this.state.acceptedValidation && this.props.accountVendorStatus.updating && (!nextProps.accountVendorStatus.updating && !nextProps.accountVendorStatus.updatingError)) this.props.close();
  }
  componentWillUnmount() {
    this.props.clearAddress();
    this.props.clearStatusErrors();
  }

  acceptAddressValidation() {
    const { vendor, validatedAddress } = this.props;
    const { userForceValidated } = this.state;

    if (userForceValidated) {
      this.props.updateAccountVendor({
        name: vendor.name,
        checkAddressValidated: null,
        checkAddressUserForceValidated: true,
      });
    } else {
      this.props.updateAccountVendor({
        name: vendor.name,
        checkAddressLine1: validatedAddress.checkAddressLine1,
        checkAddressLine2: validatedAddress.checkAddressLine2,
        checkCity: validatedAddress.checkCity,
        checkStateProv: validatedAddress.checkStateProv,
        checkPostalCode: validatedAddress.checkPostalCode,
        checkCountry: validatedAddress.checkCountry,
        checkAddressValidated: Date.now(),
        checkAddressUserForceValidated: null,
      });
    }

    this.setState({ acceptedValidation: true });
  }

  render() {
    const { vendor, status, validatedAddress, accountVendorStatus } = this.props;
    const checkAddressSetOnVendor = _try(() => vendor.checkAddressLine1 || vendor.checkAddressLine2 || vendor.checkCity || vendor.checkStateProv || vendor.checkPostalCode);
    // const addressSuccessfullyValidated = _try(() => validatedAddress.checkAddressLine1 || validatedAddress.checkAddressLine2 || validatedAddress.checkCity || validatedAddress.checkStateProv || validatedAddress.checkPostalCode);
    // const checkAddressValidationFailed = status.fetchingError;
    const alreadyForceValidated = vendor.checkAddressUserForceValidated;
    const displayForceValidation = checkAddressSetOnVendor && !alreadyForceValidated;

    const error = status.fetchingError;

    return (
      <div className="modal-dialog wide-modal wide-50 components_modals_addressValidator" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Address Validator</h5>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body p-4">
            {alreadyForceValidated &&
              <div className="alert alert-warning" role="alert">
                <h4 className="alert-heading">Address Force Validated</h4>
                This check delivery address has been force validated. {this.props.providerTheme.displayName} cannot guarantee that checks sent to this address will deliver successfully.
                <br /><br />
                You may keep the force validated address, or change the address to attempt validation with {this.props.providerTheme.displayNamePlural} integrated systems.
              </div>
            }
            <Components.entities.checkAddress id={vendor._id} validatedAddress={validatedAddress} />
            {status.fetching &&
              <div className="col-12">
                <Components.spinner />
              </div>
            }
            {error &&
              <div className="alert alert-danger mt-3" role="alert">
                <h4 className="alert-heading">Address Validation Failed</h4>
                Error: {error}
              </div>
            }
          </div>
          <div className="modal-footer">
            {displayForceValidation &&
              <Components.tooltip className="" >
                <div className="checkbox checkbox-primary me-3">
                  <input
                    id="forceValidate"
                    type="checkbox"
                    className="form-check-input"
                    onClick={() => {
                      this.setState(prevState => ({
                        userForceValidated: !prevState.userForceValidated,
                      }));
                    }}
                    checked={this.state.userForceValidated}
                  />
                  <label className="form-check-label" aria-label="Force Validate" htmlFor="forceValidate">Force Validate<i className="mdi mdi-information-outline text-warning ms-1" /></label>
                </div>
                <div>Force validation of check addresses circumvents {this.props.providerTheme.displayNamePlural} address validation. Checks sent to force validated addresses may fail to be delivered. Only force validate addresses that you are certain are valid.</div>
              </Components.tooltip>
            }
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={() => this.props.close()}
            >
              Cancel
            </button>
            <Components.button
              buttonText="Accept"
              data-dismiss="modal"
              onClick={() => this.acceptAddressValidation()}
              disabled={!accountVendorStatus.fetched || (error && !this.state.userForceValidated) || accountVendorStatus.fetching || accountVendorStatus.updating}
              updating={accountVendorStatus.updating && this.state.acceptedValidation}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_addressValidator);


