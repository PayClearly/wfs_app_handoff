import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    fundingDetails: Selectors.funding(state),
    paymentStatuses: state.account.paymentStatuses.data.items,
    paymentStatusesStatus: state.account.paymentStatuses.status,
    vendors: state.account.accountVendors.data.items,
    users: state.users.data.items,
    organization: state.organization.data,
    paymentsToBatches: Selectors.paymentsToBatches(state),
    paymentsByBatch: state.account.paymentStatuses.data.paymentsByBatch || [],
    paymentIssuesDenorm: Selectors.paymentIssues(state),
    paymentIssues: state.account.paymentIssues.data.items,
    accountBalances: state.account.accountBalances.data.item,
    providerDisplayName: Selectors.providerTheme(state).displayName,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_fundingExplanation extends Component {




  formatLineItemInflow = (value) => {
    return <h4 className="font-light mb-0 text-end"><i className={`mdi mdi-${value >= 0 ? 'plus' : 'minus'} text-${value >= 0 ? 'success' : 'danger'}`} />{numeral(Math.abs(value)).format('$0,0.00')}</h4>;
  }

  formatLineItemOutflow = (value) => {
    return <h4 className="font-light mb-0 text-end"><i className={`mdi mdi-${value < 0 ? 'plus' : 'minus'} text-${value < 0 ? 'success' : 'danger'}`} />{numeral(Math.abs(value)).format('$0,0.00')}</h4>;
  }

  render() {
    const { fundingDetails, forTransferOverview, transferItem, paymentStatuses, accountBalances } = this.props;
    let fundingAmount = _try(() => fundingDetails.currentTransferPool);
    let batchBasedFunding = _try(() => fundingDetails.earmarkEnforced);
    let showPayments = Boolean(_try(() => Object.keys(fundingDetails.unfundedPayments).length));
    let showPaymentCardChangeRequests = Boolean(_try(() => Object.keys(fundingDetails.unfundedPaymentCardChangeRequests).length));
    let paymentsForFunding = _try(() => fundingDetails.unfundedPayments);
    let paymentCardChangeRequestsToDisplay = _try(() => fundingDetails.unfundedPaymentCardChangeRequests);
    let standardTransferJustification = _try(() => fundingDetails.availableFunds);

    if (forTransferOverview) {
      fundingAmount = _try(() => transferItem.amount);
      batchBasedFunding = Boolean(_try(() => transferItem._forPayments) || _try(() => transferItem._forPaymentCardChangeRequests));
      showPayments = Boolean(_try(() => transferItem._forPayments));
      showPaymentCardChangeRequests = Boolean(_try(() => transferItem._forPaymentCardChangeRequests));
      paymentCardChangeRequestsToDisplay = _try(() => transferItem._forPaymentCardChangeRequests);
      paymentsForFunding = _try(() => transferItem._forPayments);
      standardTransferJustification = _try(() => transferItem.transferJustification) &&
        ({
          availableBalance: transferItem.transferJustification.availableBalance,
          totalPosted: transferItem.transferJustification.pendingPayments,
          totalPendingAchTransfers: transferItem.transferJustification.pendingACHTransfers,
          pendingRefunds: transferItem.transferJustification.pendingRefunds,
          resolvedIssuesQueuedForTransfer: transferItem.transferJustification.resolvedIssuesQueuedForTransfer,
          paymentCardsBalance: transferItem.transferJustification.outstandingPCards,
          totalPendingPaymentCardChangeRequests: transferItem.transferJustification.pendingPaymentCardChangeRequests,
        });
    }

    let paymentsByBatch;
    let batchDetails;
    if (batchBasedFunding) {
      const allBatchPayments = [];
      paymentsByBatch = Object.keys(paymentsForFunding || {}).reduce((acc, paymentId) => {
        const batchId = this.props.paymentsToBatches[paymentId];
        if (acc[batchId]) return acc;

        acc[batchId] = this.props.paymentsByBatch[batchId];
        allBatchPayments.push(...this.props.paymentsByBatch[batchId]);
        return acc;
      }, {});

      batchDetails = allBatchPayments.reduce((acc, paymentId) => {
        const payment = paymentStatuses[paymentId];
        const validStatus = _try(() => payment._status === 'creating') || _try(() => payment._status === 'verifying') || _try(() => payment._status === 'funding') || _try(() => payment._status === 'sending');
        if (validStatus && payment.created && payment.created.method) {
          let method = payment.created.method;
          if (_try(() => payment.created.options.isCommission)) method = 'commission';
          acc.counts[method] += 1;
          acc.amounts[method] += payment.created.amount;
          acc.amounts.total += payment.created.amount;
          return acc;
        }
        return acc;
      }, { amounts: { vCard: 0, check: 0, ACH: 0, total: 0, commission: 0 }, counts: { vCard: 0, check: 0, ACH: 0, commission: 0 } });
    }

    return (
      <div className="components_fundingExplanation">
        {batchBasedFunding ?
          <Fragment>
            {!forTransferOverview &&
              <Fragment>
                <div className="mb-3">
                  <h4 className="mb-0">Cash Flow Explanation</h4>
                  <p className="m-0 small"><em className="text-muted">The following is a breakdown of the pending deposit for your {this.props.providerDisplayName} account to fund virtual card payments and purchase cards. The deposit amount does not represent funds used for check and ACH payments. This breakouts for check and ACH payments represent the additional expected cash flow from your bank of choice. {this.props.providerDisplayName} does not track or reconcile check or ACH payments currently. For reconciling your check and ACH payments please refer to your bank statements.</em></p>
                </div>
                <div className="mb-3">
                  {batchDetails.amounts.vCard > 0 &&
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>{<span className="text-primary"><i className="mdi mdi-credit-card-outline pe-2" /></span>} Sum of Card:&nbsp;&nbsp;</span>
                      </div>
                      <div>
                        <strong className="text-primary">{numeral(batchDetails.amounts.vCard).format('$0,0.00')}</strong>
                      </div>
                    </div>
                  }
                  {batchDetails.amounts.check > 0 &&
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>{<span className="text-primary"><i className="mdi mdi-email-outline pe-2" /></span>} Sum of Check:&nbsp;&nbsp;</span>
                      </div>
                      <div>
                        <strong>{numeral(batchDetails.amounts.check).format('$0,0.00')}</strong>
                      </div>
                    </div>
                  }
                  {batchDetails.amounts.ACH > 0 &&
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>{<span className="text-primary"><i className="mdi mdi-bank pe-2" /></span>} Sum of ACH:&nbsp;&nbsp;</span>
                      </div>
                      <div>
                        <strong>{numeral(batchDetails.amounts.ACH).format('$0,0.00')}</strong>
                      </div>
                    </div>
                  }
                  {_try(() => fundingDetails.unfundedPaymentCardChangeRequestsTotal) > 0 &&
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>{<span className="text-primary"><i className="mdi mdi-credit-card-outline pe-2" /></span>} Sum of Purchase Card Funds Needed:&nbsp;&nbsp;</span>
                      </div>
                      <div>
                        <strong className="text-primary">{numeral(fundingDetails.unfundedPaymentCardChangeRequestsTotal).format('$0,0.00')}</strong>
                      </div>
                    </div>
                  }
                  {batchDetails.amounts.commission > 0 &&
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>{<span className="text-primary"><i className="mdi mdi-account-cash-outline pe-2" /></span>} Sum of Commission Payments:&nbsp;&nbsp;</span>
                      </div>
                      <div>
                        <strong className="text-primary">{numeral(batchDetails.amounts.commission).format('$0,0.00')}</strong>
                      </div>
                    </div>
                  }
                  <hr className="my-1" />
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span>{<span className="text-primary"><i className="mdi mdi-inbox-arrow-down pe-2" /></span>} Deposit for Virtual Card Funding:&nbsp;&nbsp;</span>
                    </div>
                    <div>
                      <strong className="text-primary">{numeral(fundingAmount).format('$0,0.00')}</strong>
                    </div>
                  </div>
                  {((batchDetails.amounts.check > 0) || (batchDetails.amounts.ACH > 0) || (batchDetails.amounts.commission > 0)) &&
                    <Fragment>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span>{<span className="text-primary"><i className="mdi mdi-bank-transfer-out pe-2" /></span>} Additional Cashflow from ACH and Check:&nbsp;&nbsp;</span>
                        </div>
                        <div>
                          <strong>{numeral(Utils.addDollars([batchDetails.amounts.ACH, batchDetails.amounts.check, batchDetails.amounts.commission])).format('$0,0.00')}</strong>
                        </div>
                      </div>
                      <hr className="my-1" />
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span>{<span className="text-primary"><i className="mdi mdi-currency-usd pe-2" /></span>} Total Cashflow:&nbsp;&nbsp;</span>
                        </div>
                        <div>
                          <strong>{numeral(batchDetails.amounts.total).format('$0,0.00')}</strong>
                        </div>
                      </div>
                    </Fragment>
                  }
                </div>
              </Fragment>
            }
            {showPayments &&
              <Fragment>
                <div className="mb-2 d-flex align-items-center">
                  <h4 className="mb-0 d-inline-block">Batches {forTransferOverview ? 'Funded' : 'to Fund'}</h4>
                </div>
                <Components.tables.batchhistory
                  tableKey={forTransferOverview ? 'transferOverview' : 'toFund'}
                  batchesToRender={Object.keys(paymentsByBatch)}
                  forFunding={!forTransferOverview}
                  nestedInFundingTable={forTransferOverview}
                />
              </Fragment>
            }
            {showPaymentCardChangeRequests &&
              <Fragment>
                <div className="my-2 d-flex align-items-center">
                  <h4 className="mb-0 d-inline-block">Purchase Cards {forTransferOverview ? 'Funded' : 'to Fund'}</h4>
                </div>
                <Components.tables.paymentCardChangeRequestsFunding
                  forFunding={!forTransferOverview}
                  paymentCardChangeRequestsToDisplay={paymentCardChangeRequestsToDisplay}
                />
              </Fragment>
            }
          </Fragment>
          :
          <Fragment>
            <div className="mb-3">
              <h4 className="mb-0">Funding Explanation</h4>
              <p className="m-0 small"><em className="text-muted">Breakdown of the amount needed for deposit{forTransferOverview && ' at the time of transfer creation'}</em></p>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="text-muted mb-0">Available Balance:&nbsp;&nbsp;</h5>
              </div>
              <div>
                {this.formatLineItemInflow(_try(() => standardTransferJustification.availableBalance) || 0)}
              </div>
            </div>
            {Boolean(_try(() => standardTransferJustification.totalPendingAchTransfers)) &&
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="text-muted mb-0">Pending Funding Transfers:&nbsp;&nbsp;</h5>
                </div>
                <div>
                  {this.formatLineItemInflow(_try(() => standardTransferJustification.totalPendingAchTransfers) || 0)}
                </div>
              </div>
            }
            {Boolean(_try(() => standardTransferJustification.totalPosted)) &&
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="text-muted mb-0">Pending Payments:&nbsp;&nbsp;</h5>
                </div>
                <div>
                  {this.formatLineItemOutflow(_try(() => standardTransferJustification.totalPosted) || 0)}
                </div>
              </div>
            }
            {Boolean(_try(() => standardTransferJustification.paymentCardsBalance)) &&
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="text-muted mb-0">Current Purchase Card Balance:&nbsp;&nbsp;</h5>
                </div>
                <div>
                  {this.formatLineItemOutflow(_try(() => standardTransferJustification.paymentCardsBalance) || 0)}
                </div>
              </div>
            }
            {Boolean(_try(() => standardTransferJustification.totalPendingPaymentCardChangeRequests)) &&
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="text-muted mb-0">Pending Purchase Card Funds:&nbsp;&nbsp;</h5>
                </div>
                <div>
                  {this.formatLineItemOutflow(_try(() => standardTransferJustification.totalPendingPaymentCardChangeRequests) || 0)}
                </div>
              </div>
            }
            {Boolean(_try(() => standardTransferJustification.pendingRefunds)) &&
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="text-muted mb-0">Held Refunds:&nbsp;&nbsp;</h5>
                </div>
                <div>
                  {this.formatLineItemOutflow(_try(() => standardTransferJustification.pendingRefunds) || 0)}
                </div>
              </div>
            }
            {Boolean(_try(() => standardTransferJustification.resolvedIssuesQueuedForTransfer)) &&
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="text-muted mb-0">Upcoming Withdrawals:&nbsp;&nbsp;</h5>
                </div>
                <div>
                  {this.formatLineItemOutflow(_try(() => standardTransferJustification.resolvedIssuesQueuedForTransfer) || 0)}
                </div>
              </div>
            }
            <hr className="my-1" />
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h5 className="text-muted mb-0">Deposit Amount:&nbsp;&nbsp;</h5>
              </div>
              <div>
                <h4 className="font-light mb-0 text-end">{numeral(fundingAmount).format('$0,0.00')}</h4>
              </div>
            </div>
          </Fragment>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_fundingExplanation);


