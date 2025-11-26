import { connect, Component } from 'component';

import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state) => ({
  erpIntegration: _try(() => Selectors.integrations(state).erpIntegration),
  providerTheme: Selectors.providerTheme(state),
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_overviews_paymentstatus_modules_integrations extends Component {
  render() {
    const { paymentStatus, erpIntegration } = this.props;
    if (!_try(() => paymentStatus.verified.erpRecords.length)) {
      return null;
    }

    if (!_try(() => erpIntegration.status.fetched)) {
      return <Components.horizontalLoader />;
    }

    const { verified } = paymentStatus;
    const erpResources = _try(() => erpIntegration.data.resources);
    const erpRecord = _try(() => erpResources.records[verified.erpRecords[0]]);
    if (!erpRecord) {
      return null;
    }

    let color = 'success';
    let message = `${_try(() => erpIntegration.providerInfo.name, 'ERP/Accounting')} Record Written`;
    let content;

    if (!_try(() => this.props.erpIntegration.linked)) {
      content = (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">ERP/Accounting Integration No Longer Found</h4>
              Your {this.props.providerTheme.displayName} account is no longer linked
              with any ERP/Accounting Integrations. A record has been written to your provider for this payment,
              yet details cannot be retrieved without a valid integration link. Please visit account settings to link
              your {this.props.providerTheme.displayName} account with your ERP/Accounting provider.
            </div>
          </div>
        </div>
      );
    } else {
      content = (
        <div className="row">
          {erpRecord.ref
            && (
              <div className="col-xs-12 col-md-4">
                <strong>Payment Ref #</strong>
                <br />
                <p className="text-muted">P_{erpRecord.ref}</p>
              </div>
            )}
          {_try(() => erpResources.accounts[erpRecord.account])
            && (
              <div className="col-xs-12 col-md-4">
                <strong>Account</strong>
                <br />
                <p className="text-muted">{_try(() => erpResources.accounts[erpRecord.account].name) || 'n/a'}</p>
              </div>
            )}
          {_try(() => erpResources.vendors[erpRecord.vendor])
            && (
              <div className="col-xs-12 col-md-4">
                <strong>Vendor</strong>
                <br />
                <p className="text-muted">{_try(() => erpResources.vendors[erpRecord.vendor].name) || 'n/a'}</p>
              </div>
            )}
          {_try(() => erpResources.categories[erpRecord.category])
            && (
              <div className="col-xs-12 col-md-4">
                <strong>Category</strong>
                <br />
                <p className="text-muted">{_try(() => erpResources.categories[erpRecord.category].name) || 'n/a'}</p>
              </div>
            )}
          {_try(() => erpResources.classes[erpRecord.class])
            && (
              <div className="col-xs-12 col-md-4">
                <strong>Class</strong>
                <br />
                <p className="text-muted">{_try(() => erpResources.classes[erpRecord.class].name) || 'n/a'}</p>
              </div>
            )}
        </div>
      );
    }

    if (erpRecord.status === 'error') {
      color = 'danger';
      message = 'Error Occurred';
      content = (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Accounting Error</h4>
              An error occurred when connecting or writing to your Accounting software.
              Please visit account settings to confirm that your Accounting Integration
              credentials are accurate.
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <hr className="m-0" />
        <h2 className="m-0 py-3 d-inline-block">Integrations</h2>
        <span className={`badge rounded-pill ms-3 bg-${color}`}>{message}</span>
        <div className="components_overviews_paymentstatus_modules_integrations">
          <div className="ps-4">
            {content}
          </div>
        </div>
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_paymentstatus_modules_integrations);
