import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    selectedVendor: _try(() => Selectors.accountVendors(state).all[props.id], {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openModal: (name, data) => {
      dispatch(Store.router.openModal(name, data));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_overviews_accountVendorEnrollmentVendorDetails extends Component {




  render() {
    const { selectedVendor, id } = this.props;
    const notSetTag = (<i>Not set</i>);

    return (
      <div className="components_overviews_accountVendorEnrollmentVendorDetails">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="card-title m-0">Vendor Details</h3>
          <Components.button
            buttonText="Edit Vendor Details"
            onClick={(e) => {
              e.preventDefault();
              this.props.openModal('Components.modals.updateaccountvendor', { id });
            }}
            className="btn btn-primary"
            ariaLabel="Edit Vendor Details"
            icon="mdi mdi-pencil text-white"
            iconLeft
          />
        </div>
        <div className="row mt-2">
          <div className="col-6 col-md-3">
            <strong>Contact Name</strong>
            <br />
            <p className="text-muted">
              {selectedVendor.contactName || notSetTag}
            </p>
          </div>
          <div className="col-6 col-md-3">
            <strong>Contact Email</strong>
            <br />
            <p className="text-muted">
              {selectedVendor.contactEmail || notSetTag}
            </p>
          </div>
          <div className="col-6 col-md-3">
            <strong>Contact Phone Number</strong>
            <br />
            <p className="text-muted">
              {selectedVendor.contactPhoneNumber || notSetTag}
            </p>
          </div>
          <div className="col-6 col-md-3">
            <strong>Contact Fax Number</strong>
            <br />
            <p className="text-muted">
              {selectedVendor.contactFaxNumber || notSetTag}
            </p>
          </div>
        </div>
        <Components.accountVendorPaymentDetails id={id} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_overviews_accountVendorEnrollmentVendorDetails);


