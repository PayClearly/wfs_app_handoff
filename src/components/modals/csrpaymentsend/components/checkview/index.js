/* eslint-disable max-len */
import { connect, Component } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  accountId: state.account.data.id,
  accounts: state.accounts,
  checksIntegration: _try(() => Selectors.integrations(state).checksIntegration, {}),
  globalVendors: state.global.vendors.data.items,
  paymentStatuses: state.account.paymentStatuses,
  uspsStatus: state.account.usps.status,
  csrGlobalItems: Selectors.csrGlobalItems(state),
});

const mapDispatchToProps = (dispatch) => ({
  markPaymentAsSent: (id, params) => {
    dispatch(Store.account.updatePaymentPipelines([id], 'markAsSent', params));
  },
  verifyMailingAddress: (data) => {
    dispatch(Store.account.verifyMailingAddress(data));
  },
});

// eslint-disable-next-line camelcase
class components_modals_csrpaymentsend_components_checkview extends Component {
  componentDidMount() {
    const { csrGlobalItems } = this.props;
    const paymentStatus = this.props.paymentStatuses.data.items[this.props.id];
    const { method } = paymentStatus.created;

    const globalVendorId = _try(() => paymentStatus.created.globalVendorId);
    const tagId = _try(() => paymentStatus.created.globalVendorTagId);

    const PSOPData = _try(() => csrGlobalItems.vendorTagToPSOP[globalVendorId][tagId][method]);
    const paymentProcedure = _try(() => PSOPData.procedure, {});

    if (_try(() => this.props.checksIntegration.linked && !this.props.checksIntegration.requiresSetup)) {
      return this.props.verifyMailingAddress(paymentProcedure.checkPaymentAddress);
    }
  }

  render() {
    const { csrGlobalItems } = this.props;

    if (csrGlobalItems.notFetched) {
      return (
        <div className="h-100 w-100" role="document">
          <div className="modal-content h-100 w-100">
            <div className="modal-header">
              <h4 className="modal-title" id="exampleModalLabel">
                Loading...
              </h4>
              <button
                onClick={this.props.close}
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    const paymentStatus = this.props.paymentStatuses.data.items[this.props.id];
    const { method } = paymentStatus.created;
    const createdStep = paymentStatus.created;
    const disableButtons = this.props.paymentStatuses.status.updating
      || this.props.uspsStatus.fetching
      || this.props.uspsStatus.fetchingError;
    const account = this.props.accounts.data.items[this.props.accountId];

    const globalVendorId = _try(() => paymentStatus.created.globalVendorId);
    const globalVendor = this.props.globalVendors[globalVendorId || false];
    const tagId = _try(() => paymentStatus.created.globalVendorTagId);

    const PSOPData = _try(() => csrGlobalItems.vendorTagToPSOP[globalVendorId][tagId][method]);
    const paymentProcedure = _try(() => PSOPData.procedure, {});


    return (
      <div className="h-100 w-100" role="document">
        <div className="modal-content h-100 w-100">
          <div className="modal-header">
            <h4 className="modal-title" id="exampleModalLabel">
              Send Payment
            </h4>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            <div className={'row'}>
              <div className={'col-12'}>
                <div className="alert alert-warning" role="alert">
                  This Account is not currently enrolled in Automated Check P. The customer might be
                  sending this payment manually or it could have been made in error.
                </div>
              </div>
            </div>
            <div className={'row mb-3'}>
              <div className={'col-12'}>
                <h3>
                  Please perform a
                  <span className="fw-bold pe-2 ps-2">{numeral(createdStep.amount).format('$0,0.00')}</span>
                  payment from
                  <span className="fw-bold pe-2 ps-2">{account.name}</span>
                  to
                  <span className="fw-bold pe-2 ps-2">
                    {(paymentProcedure.checkPayeeName) ? paymentProcedure.checkPayeeName : globalVendor.name}
                  </span>
                  using group
                  <span className="fw-bold ps-2">
                    {_try(() => PSOPData.groupName, 'Unknown')}
                  </span>
                </h3>
              </div>
            </div>
            <div className={'row mb-3'}>
              {
                paymentProcedure.notes && (
                  <div className="col-12 mb-3">
                    <div className={'card h-100'}>
                      <div className={'card-header default-bg'}>
                        Notes about how to pay this vendor
                      </div>
                      <div className={'card-body'}>
                        <strong>Notes:</strong>
                        <br />
                        <p className={'multi-lined-text mb-3'}>{paymentProcedure.notes}</p>
                      </div>
                    </div>
                  </div>
                )
              }
              <div className={'col-xs-12 col-md-6'}>
                <div className={'card h-100'}>
                  <div className={'card-header default-bg'}>
                    Payment Information
                  </div>
                  <div className={'card-body'}>
                    <div className={'row'}>
                      <div className={'col-6'}>
                        {(() => {
                          if (!paymentProcedure.checkPaymentAddress) {
                            return (
                              'No mailing address set for check.'
                            );
                          }
                          return (
                            <>
                              <strong>Check Mailing Address:</strong>
                              <br />
                              <div>{paymentProcedure.checkPaymentAddress.streetAddress}</div>
                              <div>{paymentProcedure.checkPaymentAddress.unit || ''}</div>
                              <div>
                                {paymentProcedure.checkPaymentAddress.city} {paymentProcedure.checkPaymentAddress.state},
                                {paymentProcedure.checkPaymentAddress.zipCode} {paymentProcedure.checkPaymentAddress.country}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <div className={'col-4'}>
                        <strong>USPS address validator:</strong>
                        <br />
                        {this.props.uspsStatus.fetched && 'Valid address' || this.props.uspsStatus.fetchingError && 'Invalid Address'}
                      </div>
                      <div className={'col-2'}>
                        {this.props.uspsStatus.fetched && (
                          <span className="text-success">
                            <i className="mdi mdi-check mdi-48px" style={{ 'line-height': '48px' }} />
                          </span>
                        )
                          || this.props.uspsStatus.fetchingError && (
                            <span className="text-danger">
                              <i className="mdi mdi-alert mdi-48px" style={{ 'line-height': '48px' }} />
                            </span>
                          )
                          || <Components.spinner />}
                      </div>
                    </div>
                    <div className={'row pt-3'}>
                      <div className={'col-6'}>
                        <strong>Check Payee:</strong>
                        <br />
                        <div>{(paymentProcedure.checkPayeeName && paymentProcedure.checkPayeeName !== '') ? paymentProcedure.checkPayeeName : globalVendor.name}</div>
                        <br />
                      </div>
                      <div className={'col-6'}>
                        <strong>Check Memo:</strong>
                        <br />
                        {createdStep.memo ? createdStep.memo.split(/\|/g).map((e) => <p>{e}</p>) : `${globalVendor.name}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={() => {
                if (disableButtons) { return; } this.props.close();
              }}
              disabled={disableButtons}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-danger"
              data-dismiss="modal"
              onClick={() => {
                if (disableButtons || !_try(() => this.props.checksIntegration.linked && !this.props.checksIntegration.requiresSetup)) { return; } this.props.markPaymentAsSent(this.props.id);
              }}
              disabled={disableButtons || !_try(() => this.props.checksIntegration.linked && !this.props.checksIntegration.requiresSetup)}
            >
              Mark As Sent
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_csrpaymentsend_components_checkview);


