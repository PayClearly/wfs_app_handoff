import {
  connect, Component,
} from 'component';
import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';
import config from '../../apps/app/config.json';

const mapStateToProps = (state, props) => ({
  vendor: state.account.accountVendors.data.items[props.id] || {},
  selectedVendor: _try(() => Selectors.accountVendors(state).all[props.id], {}),
  paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item || {},
  providerTheme: Selectors.providerTheme(state),
});

const mapDispatchToProps = (dispatch, props) => ({});

const mapResourcesToProps = (state, props) => ({});

class components_accountVendorPaymentDetails extends Component {

  componentDidMount() { }

  componentWillUnmount() { }

  render() {
    const { vendor, selectedVendor = {} } = this.props;
    const notSetTag = (<i>Not set</i>);

    const methodMetadata = {
      vCard: {
        title: 'Cards',
        icon: 'mdi-credit-card-outline',
      },
      check: {
        title: 'Checks',
        icon: 'mdi-email-outline',
      },
      ACH: {
        title: 'ACH',
        icon: 'mdi-bank',
      },
    };

    const allowPCtoHandle = {
      vCard: true,
      ACH: true,
      check: _try(() => this.props.paymentPipelinePreferences.allowPCtoHandle.check),
    };

    return (
      <div className="components_accountVendorPaymentDetails">
        <div className="row mt-3">
          {['vCard', 'ACH', 'check'].map((method) => {
            const methodTitle = methodMetadata[method].title;
            const selfServe = _try(() => selectedVendor.selfServe[method]);
            const managedByPayClearly = _try(() => !selectedVendor.selfServe[method] && selectedVendor.linkedWithPayClearly && allowPCtoHandle[method]);
            const managedByAccount = _try(() => !selectedVendor.selfServe[method] && (!selectedVendor.linkedWithPayClearly || !allowPCtoHandle[method]));
            return (
              <div className="col-12 col-md-4 mb-3 mb-md-0">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column justify-content-center">
                    {!_try(() => selectedVendor.accepts[method])
                      && (
                        <div className="d-flex justify-content-around align-items-center h-100">
                          <div><i className={`mdi ${methodMetadata[method].icon} methodIcon text-secondary`} /></div>
                          <h4 className="m-0">{methodTitle} Not Accepted</h4>
                        </div>
                      )}
                    {_try(() => selectedVendor.accepts[method])
                      && <>
                        <div className="d-flex justify-content-around align-items-center">
                          <i className={`mdi ${methodMetadata[method].icon} methodIcon text-primary`} />
                          <div className="position-relative">
                            <h4 className="m-0">{methodTitle} Accepted</h4>
                            {selfServe
                              && (
                                <Components.tooltip className="managedByIcon">
                                  <i className="mdi mdi-account-circle text-primary" />
                                  <div>Self Serve</div>
                                </Components.tooltip>
                              )}
                            {managedByPayClearly
                              && (
                                <Components.tooltip className="managedByIconImg">
                                  <img src={config.favicon} alt={`${this.props.providerTheme.displayName} Logo`} />
                                  <div>Managed by PayClearly</div>
                                </Components.tooltip>
                              )}
                            {managedByAccount
                              && (
                                <Components.tooltip className="managedByIcon">
                                  <i className="mdi mdi-check-circle text-primary" />
                                  <div>Managed by Account</div>
                                </Components.tooltip>
                              )}
                          </div>
                        </div>
                        {managedByAccount
                          && <>
                            <div>
                              <hr />
                            </div>
                            {method === 'check'
                              && <Components.accountVendorAddress vendor={vendor} />}
                            {method === 'vCard'
                              && (
                                <div className="row">
                                  <div className="col-md-6 col-12">
                                    <strong>Card Delivery Emails</strong>
                                    <br />
                                    <p className="text-muted">
                                      {(vendor.vCardEmails || []).length && vendor.vCardEmails.join(',') || notSetTag}
                                    </p>
                                  </div>
                                  <div className="col-md-6 col-12">
                                    <strong>Card Delivery Faxes</strong>
                                    <br />
                                    <p className="text-muted">
                                      {(vendor.vCardFaxes || []).length && vendor.vCardFaxes.join(',') || notSetTag}
                                    </p>
                                  </div>
                                  {(vendor.galileoVCardDefaultMaxUses || vendor.vCardDefaultMaxUses /** WEX only */) && (
                                    <div className="col-md-6 col-12">
                                      <strong>Default Virtual Card Max Uses</strong>
                                      <br />
                                      <p className="text-muted">
                                        {vendor.galileoVCardDefaultMaxUses || vendor.vCardDefaultMaxUses /** WEX only */}
                                      </p>
                                    </div>
                                  )}
                                  {selectedVendor.vCardPaymentLimit
                                    && (
                                      <div className="col-md-6 col-6">
                                        <strong>Card Payment Limit</strong>
                                        <br />
                                        <p className="text-muted">
                                          {Utils.numeral()(selectedVendor.vCardPaymentLimit).format('$0,0.00')}
                                        </p>
                                      </div>
                                    )}
                                  {selectedVendor.vCardFee
                                    && (
                                      <div className="col-md-6 col-12">
                                        <strong>Card Fee</strong>
                                        <br />
                                        <p className="text-muted">{selectedVendor.vCardFee.type === 'fixed' ? Utils.numeral()(selectedVendor.vCardFee.value).format('$0,0.00') : `${selectedVendor.vCardFee.value}%`}</p>
                                      </div>
                                    )}
                                </div>
                              )}
                            {method === 'ACH'
                              && (
                                <div className="alert alert-warning m-0" role="alert">
                                  <h4 className="alert-heading">{this.props.providerTheme.displayName} Link Needed</h4>
                                  You must link with a {this.props.providerTheme.displayName} vendor to be able to send ACH payments via our platform.
                                  <br /><br />
                                  If you have any questions please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
                                </div>
                              )}
                          </>}
                      </>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_accountVendorPaymentDetails);


