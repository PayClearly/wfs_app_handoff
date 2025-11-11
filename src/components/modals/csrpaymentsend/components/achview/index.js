import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    accountId: state.account.data.id,
    accounts: state.accounts,
    achIntegration: _try(() => Selectors.integrations(state).achIntegration, {}),
    globalVendors: state.global.vendors.data.items,
    notificationStatuses: state.notificationStatuses,
    proceduresStatus: state.global.procedures.status,
    paymentStatuses: state.account.paymentStatuses,
    csrGlobalItems: Selectors.csrGlobalItems(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    syncNotificationStatuses: (ids) => { dispatch(Store.notificationstatuses.sync(ids)); },
    clearNotifications: () => { dispatch(Store.notificationstatuses.clear()); },
    clearResendErrors: () => { dispatch(Store.global.clearErrorsGlobalVendorSchemas()); },
    markPaymentAsSent: (id, params) => {
      dispatch(Store.account.updatePaymentPipelines([id], 'markAsSent', params));
    },
    verifyMailingAddress: (data) => {
      dispatch(Store.account.verifyMailingAddress(data));
    },
  });
};


class components_modals_csrpaymentsend_components_achview extends Component {
  state = {
    paymentProcedure: {},
    paymentStatus: {},
    emailResent: false,
  }

  componentDidMount() {
    const { paymentProcedure } = this.getData(this.props);

    if (paymentProcedure.achTermsAttempts) this.props.syncNotificationStatuses(paymentProcedure.achTermsAttempts);
  }

  componentWillReceiveProps(nextProps = {}) {
    const { paymentProcedure } = this.getData(this.props);
    const { paymentProcedure: nextPaymentProcedure } = this.getData(nextProps);

    const achTermsAttempts = paymentProcedure.achTermsAttempts || [];
    const nextAchTermsAttempts = nextPaymentProcedure.achTermsAttempts || [];

    if (achTermsAttempts.length !== nextAchTermsAttempts.length) {
      this.props.syncNotificationStatuses(nextAchTermsAttempts);
    }
  }

  componentWillUnmount() {
    this.props.clearNotifications();
  }

  getData = (props) => {
    const { csrGlobalItems } = props;
    const paymentStatus = props.paymentStatuses.data.items[props.id];
    const createdStep = paymentStatus.created;
    const method = paymentStatus.created.method;

    const globalVendorId = _try(() => paymentStatus.created.globalVendorId);
    const globalVendor = _try(() => props.globalVendors[globalVendorId]);
    const tagId = _try(() => paymentStatus.created.globalVendorTagId);

    const PSOPData = _try(() => csrGlobalItems.vendorTagToPSOP[globalVendorId][tagId][method]);

    const paymentProcedure = !props.proceduresStatus.fetching && _try(() => PSOPData.procedure, {});
    const account = props.accounts.data.items[props.accountId];

    return { paymentProcedure, paymentStatus, globalVendorGroupName: _try(() => PSOPData.groupName, 'Unknown'), globalVendor, createdStep, account };
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
              <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    const achFundingSource = _try(() => this.props.achIntegration.details.fundingSource, {});
    const { paymentProcedure, paymentStatus, globalVendorGroupName, globalVendor, createdStep, account } = this.getData(this.props);
    const paymentFields = paymentStatus.created.paymentFields;
    const isPaymentReady = this.props.achIntegration.linked && !this.props.achIntegration.requiresSetup;

    const updating = this.props.paymentStatuses.status.updating;
    const disableButtons = !isPaymentReady || !paymentProcedure.achLastAcceptedTermsAndConditions;

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
            {
              !isPaymentReady &&
              <div className={'row'}>
                <div className={'col-12'}>
                  <div className="alert alert-danger" role="alert">
                    This account is not currently enrolled in automated ACH payments. The customer could be sending this payment manually or it could have been made in error.
                    You can check the current status of the account in the settings page.
                  </div>
                </div>
              </div>
            }
            {
              !paymentProcedure.achLastAcceptedTermsAndConditions &&
              <div className={'row'}>
                <div className={'col-12'}>
                  <div className="alert alert-danger" role="alert">
                    The vendor has not yet accepted the terms and conditions required for accepting ACHs
                  </div>
                </div>
              </div>
            }
            {globalVendor &&
              <div className={'row mb-3'}>
                <div className={'col-12'}>
                  <h3>
                    Please perform a
                    <span className="fw-bold pe-2 ps-2">{numeral(createdStep.amount).format('$0,0.00')}</span>
                    payment from
                    <span className="fw-bold pe-2 ps-2">{account.name}</span>
                    to
                    <span className="fw-bold pe-2 ps-2">
                      {globalVendor.name}
                    </span>
                    using group
                    <span className="fw-bold ps-2">
                      {globalVendorGroupName}
                    </span>
                  </h3>
                </div>
              </div>
            }
            <div className={'row mb-3'}>
              {
                paymentProcedure.notes &&
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
              }

              <div className={'col-xs-12 col-md-6'}>
                <div className={'card h-100'}>
                  <div className={'card-header default-bg'}>
                    ACH Source
                  </div>
                  {achFundingSource &&
                    <div className={'card-body'}>
                      <strong>Bank Name:</strong>
                      <br />
                      <p>{achFundingSource.bankName}</p>
                      <strong>Account Name:</strong>
                      <br />
                      <p>{achFundingSource.name}</p>
                      <strong>Account Type:</strong>
                      <br />
                      <p>{achFundingSource.bankAccountType}</p>
                    </div>
                  }
                </div>
              </div>

              <div className={'col-xs-12 col-md-6'}>
                <div className={'card h-100'}>
                  <div className={'card-header default-bg'}>
                    ACH Destination
                  </div>
                  <div className={'card-body'}>
                    <strong>First Name:</strong>
                    <br />
                    <p>{paymentProcedure.achFirstName}</p>
                    <strong>Last Name:</strong>
                    <br />
                    <p>{paymentProcedure.achLastName}</p>
                    <strong>Email:</strong>
                    <br />
                    <p>{paymentProcedure.achEmail}</p>
                    <strong>Bank Name:</strong>
                    <br />
                    <p>{paymentProcedure.achBankName}</p>
                    <strong>Routing Number:</strong>
                    <br />
                    <p>{paymentProcedure.achRoutingNumber}</p>
                    <div>
                      <h4>Terms and Conditions Email</h4>
                      <p><strong>Last Sent: </strong>{_try(() => Utils.dates.dateToDay(this.props.notificationStatuses.data.items[paymentProcedure.achTermsAttempts[paymentProcedure.achTermsAttempts.length - 1]].sentAt)) || 'Never'}</p>
                      <p><strong>Total Attempts: </strong>{_try(() => paymentProcedure.achTermsAttempts.length) || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-xs-12 col-md-6">
                <div className={'card h-100'}>
                  <div className={'card-header default-bg'}>
                    Payment Fields
                  </div>
                  <div className={'card-body'}>
                    {Object.keys(paymentFields || {})
                      .map((key, index) => {
                        return (<div><strong>{key}</strong><p>{paymentFields[key]}{Object.keys(paymentFields).length - 1 > index && paymentFields[key] ? ', ' : ''}</p></div>);
                      })}
                  </div>
                </div>
              </div>
              <div className="col-xs-12 col-md-6">
                <div className={'card h-100'}>
                  <div className={'card-header default-bg'}>
                    Destination Notes:
                  </div>
                  <div className={'card-body'}>
                    {paymentProcedure.achNotes}
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
              onClick={() => { return this.props.close(); }}
              disabled={updating}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-danger"
              data-dismiss="modal"
              onClick={() => { if (disableButtons || !isPaymentReady) return; this.props.markPaymentAsSent(this.props.id); }}
              disabled={disableButtons || !isPaymentReady}
            >
              Mark As Sent
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_csrpaymentsend_components_achview);


