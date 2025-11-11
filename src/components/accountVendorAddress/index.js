import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    countryCodes: Selectors.countryCodes(),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openValidateAddressModal: (id) => {
      dispatch(Store.router.openModal('Components.modals.addressValidator', { id }));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_accountVendorAddress extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  renderValidationIcon = () => {
    const { vendor } = this.props;

    if (vendor.checkAddressValidated) {
      return (
        <Components.tooltip className="d-inline ms-2">
          <i className="mdi mdi-check-circle-outline text-success" />
          <div>Address Validated</div>
        </Components.tooltip>
      );
    } else if (vendor.checkAddressUserForceValidated) {
      return (
        <Components.tooltip className="d-inline ms-2">
          <i className="mdi mdi-information-outline text-warning" />
          <div>Address Force Validated</div>
        </Components.tooltip>
      );
    }
    return (
      <Components.tooltip className="d-inline ms-2">
        <i className="mdi mdi-alert-circle-outline text-danger" />
        <div>Address Not Validated</div>
      </Components.tooltip>
    );
  }

  render() {
    const { vendor } = this.props;
    const countryCodes = this.props.countryCodes;
    const checkAddressExists = _try(() => vendor.checkAddressLine1 && vendor.checkCity);

    return (
      <div className="components_accountVendorAddress">
        <strong>Mailing Address</strong>
        {this.renderValidationIcon()}
        <br />

        <div className="mb-3">
          {checkAddressExists ?
            <Fragment>
              <p className="mb-0">{vendor.checkAddressLine1}</p>
              <p className="mb-0">{vendor.checkAddressLine2}</p>
              <p className="mb-0">{vendor.checkAddressLine3}</p>
              <p className="mb-0">{vendor.checkCity ? `${vendor.checkCity}, ` : ''}{vendor.checkStateProv || ''} {vendor.checkPostalCode || ''}</p>
              <p className="mb-0">{vendor.checkCountry ? countryCodes[vendor.checkCountry] : ''}</p>
            </Fragment>
            :
            <i>No Address Set</i>
          }
        </div>

        {
          !vendor.checkAddressValidated &&
          <div className="row">
            <div className="col-12 mb-0">
              <Components.button
                buttonText="Validate"
                onClick={() => this.props.openValidateAddressModal(vendor._id)}
                ariaLabel="Validate Mailing Address"
              />
            </div>
          </div>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_accountVendorAddress);


