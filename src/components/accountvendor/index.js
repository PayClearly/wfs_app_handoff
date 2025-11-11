import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    vendor: state.account.accountVendors.data.items[props.id] || {},
    selectedVendor: _try(() => Selectors.accountVendors(state).all[props.id], {}),
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_accountvendor extends Component {




  renderWarning(vendor) {

  }

  render() {
    const { vendor, selectedVendor = {} } = this.props;
    const notSetTag = (<i>Not set</i>);

    // Vendor Details
    const name = selectedVendor.name || notSetTag;
    const displayName = selectedVendor.displayName || notSetTag;
    const linked = selectedVendor.linkedWithPayClearly ? selectedVendor.linkedWithPayClearlyName : <i>Not linked</i>;

    return (
      <div className="components_accountvendor">
        <h1 className="mb-0">{selectedVendor.display}</h1>
        <br />
        {selectedVendor.accepts.isNonAcceptor &&
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">No Payments Accepted</h4>
            Our records show that this vendor does not accept payments for the vendor categories you have selected, has changed their name, or is defunct. <br /><br />
            If you have any questions please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
          </div>
        }
        {selectedVendor.needsAttentionNoMethodSelected &&
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Information Required</h4>
            Since this vendor is not linked with {this.props.providerTheme.displayName} you must either link it or select a payment method
          </div>
        }
        {selectedVendor.needsAttentionGlobalVendorInactive &&
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Issue With Link</h4>
            The {this.props.providerTheme.displayName} vendor you have linked with has been marked inactive, you must link to an active {this.props.providerTheme.displayName} vendor to continue making payments. <br /><br />
            If you have any questions please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
          </div>
        }
        <h3>Vendor Details</h3>
        <div className="row mt-3">
          <div className="col-md col-6">
            <strong>Name</strong>
            <br />
            <p className="text-muted">
              {name}
            </p>
          </div>
          <div className="col-md col-6">
            <strong>Display Name (Optional)</strong>
            <br />
            <p className="text-muted">
              {displayName}
            </p>
          </div>
          <div className="col-md col-6">
            <strong>Linked</strong>
            <br />
            <p className="text-muted">
              {linked}
            </p>
          </div>
          <div className="col-md col-6">
            <strong>Status</strong>
            <br />
            <p className="text-muted">
              <Components.badges.status data={selectedVendor.active} />
            </p>
          </div>
        </div>
        <Components.accountVendorPaymentDetails id={this.props.id} />
        <h3 className="mt-4">Notification Settings</h3>
        <div className="row">
          <div className="col-12">
            <strong>Contact Emails</strong>
            <br />
            <p className="text-muted">
              {(vendor.repEmails || []).length && vendor.repEmails.join(',') || notSetTag}
            </p>
          </div>
        </div>
        <h3 className="mt-2">ERP/Accounting Link</h3>
        <div className="row">
          <div className="col-6">
            <strong>Vendor Name</strong>
            <br />
            <p className="text-muted">
              {selectedVendor.erpVendorText || notSetTag}
            </p>
          </div>
          <div className="col-6">
            <strong>Default Category</strong>
            <br />
            <p className="text-muted">
              {selectedVendor.erpCategoryText || notSetTag}
            </p>
          </div>
        </div>
        <h3 className="mt-4">Contact Details</h3>
        <div className="row">
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
        <div className="row">
          <div className="col-12 col-md-12">
            <strong>Payment Notes</strong>
            <br />
            <p className="text-muted">
              {selectedVendor.notes || notSetTag}
            </p>
          </div>
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(components_accountvendor);


