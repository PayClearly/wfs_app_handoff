/* eslint-disable class-methods-use-this */
import { connect, Component } from 'component';

// Third Party Imports ...
import numeral from 'numeral';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  accountItem: _try(() => state.accounts.data.items[state.account.data.id], {}),
  availableFunds: _try(() => Selectors.availableFunds(state)),
});

const mapDispatchToProps = (dispatch) => ({
  navigateToPayments: () => dispatch(Store.router.navigateTo('history', { sort: 'hasIssues' })),
});

// eslint-disable-next-line camelcase
class components_widgets_availablefunds extends Component {

  state = {
    popoverOpen: false,
  };

  _onClickToggleDetails = () => {
    this.setState((prevState) => ({ popoverOpen: !prevState.popoverOpen }));
  };

  _navigateToPaymentsPage = () => {
    this.props.navigateToPayments();
  };

  formatPopperLineItemInflow = (value) => (
    <h2 className="font-light mb-0 text-end">
      <i className={`mdi mdi-${value >= 0 ? 'plus' : 'minus'} text-${value >= 0 ? 'success' : 'danger'}`} />
      {numeral(Math.abs(value)).format('$0,0.00')}
    </h2>
  );

  formatPopperLineItemOutflow = (value) => (
    <h2 className="font-light mb-0 text-end">
      <i className={`mdi mdi-${value < 0 ? 'plus' : 'minus'} text-${value < 0 ? 'success' : 'danger'}`} />
      {numeral(Math.abs(value)).format('$0,0.00')}
    </h2>
  );

  render() {
    const { availableFunds, accountItem } = this.props;
    const { exposure, suspended } = accountItem;
    const loaded = _try(() => availableFunds.loaded);

    return (
      <div
        className="card widget-small components_widgets_availablefunds"
        role="ToolTip"
        id="funds-details"
        onClick={loaded && this._onClickToggleDetails}
      >
        <div className="card-body">
          {Boolean(_try(() => (availableFunds.pendingRefunds)) || suspended) && loaded
            && (
              <span
                className="text-danger"
                style={{ position: 'absolute', right: '0px', top: '-7px' }}
              >
                <i className="mdi mdi-alert-circle-outline mdi-36px" />
              </span>
            )}
          <h4 className="card-title">Available
            <span className="text-nowrap">
              Funds
              <i className={`mdi mdi-chevron-${this.state.popoverOpen ? 'down' : 'right'}`} />
            </span>
          </h4>
          {loaded
            && (
              <div>
                <h2 className="font-light mb-0 text-truncate">
                  <i
                    className={`mdi mdi-${availableFunds.totalAvailable >= 0 ? 'plus' : 'minus'} `
                      + `text-${availableFunds.totalAvailable >= 0 ? 'success' : 'danger'}`}
                  />
                  {availableFunds.totalAvailable >= 1000000
                    ? numeral(Math.abs(availableFunds.totalAvailable)).format('($ 0.00a)')
                    : numeral(Math.abs(availableFunds.totalAvailable)).format('$0,0.00')}
                </h2>
              </div>
            )}
          {!loaded
            && <Components.horizontalLoader />}
        </div>
        {loaded && (
          <Popover
            placement={'bottom'}
            isOpen={this.state.popoverOpen}
            target={'funds-details'}
            toggle={this._onClickToggleDetails}
            trigger="legacy"
            className="popover-override"
          >
            <PopoverHeader className="popover-header-override">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  Available Funds Details
                </div>
                <div>
                  <i
                    className="mdi mdi-close close"
                    style={{ cursor: 'pointer' }}
                    onClick={this._onClickToggleDetails}
                  />
                </div>
              </div>
            </PopoverHeader>
            <PopoverBody>
              <Components.featureFlagWrapper featureKey="exposureManagement">
                {suspended
                  ? (
                    <div className="alert alert-danger" role="alert" style={{ maxWidth: '26rem' }}>
                      This account is currently suspended. Please contact you account
                      administrator to get this resolved.
                    </div>
                  )
                  : null}
                <div
                  className="d-flex justify-content-between align-items-center"
                  style={{ borderBottom: 'solid 1px rgb(220, 220, 220)' }}
                >
                  <div className="text">
                    <span className="text-muted">Current Exposure</span>
                    <h2 className="font-light m-b-0">
                      <i className="ti-arrow-up text-success" />{numeral(exposure || 0).format('$0,0.00')}
                    </h2>
                  </div>
                  <div className="text">
                    <span className="text-muted">Target Credit Limit</span>
                    <h2 className="font-light m-b-0" style={{ textAlign: 'right' }}>
                      <i className="ti-arrow-up text-success" />
                      {numeral(availableFunds.targetCreditLimit || availableFunds.creditLimit).format('$0,0.00')}
                    </h2>
                  </div>
                </div>
              </Components.featureFlagWrapper>
              {typeof availableFunds.totalCashBalance === 'number'
                && (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="text-muted mb-0">
                        {availableFunds.totalCreditBalance
                          ? 'Credit Balance:'
                          : 'Cash Balance'}
                        <small style={{ fontSize: '14px' }} className="text-muted mb-0">
                          {`(as of ${availableFunds.integrationLastSync
                            ? new Date(availableFunds.integrationLastSync).toLocaleTimeString()
                            : 'unknown'})`}
                        </small>&nbsp;&nbsp;
                      </h3>
                    </div>
                    <div>
                      {this.formatPopperLineItemInflow(availableFunds.totalCashBalance)}
                    </div>
                  </div>
                )}
              {Boolean(availableFunds.totalPendingAchTransfers)
                && (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="text-muted mb-0">Pending Funding Transfers:&nbsp;&nbsp;</h3>
                    </div>
                    <div>
                      {this.formatPopperLineItemInflow(availableFunds.totalPendingAchTransfers || 0)}
                    </div>
                  </div>
                )}
              {}
              {Boolean(availableFunds.totalSent)
                && (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="text-muted mb-0">Pending Payments:&nbsp;&nbsp;</h3>
                    </div>
                    <div>
                      {this.formatPopperLineItemOutflow(availableFunds.totalSent)}
                    </div>
                  </div>
                )}
              {Boolean(availableFunds.totalPendingPaymentCardChangeRequests)
                && (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="text-muted mb-0">Pending Purchase Card Funds:&nbsp;&nbsp;</h3>
                    </div>
                    <div>
                      {this.formatPopperLineItemOutflow(availableFunds.totalPendingPaymentCardChangeRequests)}
                    </div>
                  </div>
                )}
              {Boolean(availableFunds.pendingRefunds)
                && (
                  <div
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex="-1"
                    className="d-flex justify-content-between align-items-center"
                    onClick={() => { this._navigateToPaymentsPage(); }}
                  >
                    <div>
                      <h3 className="text-muted mb-0">
                        <i className="mdi mdi-alert-circle-outline text-danger" /> Held Refunds:&nbsp;&nbsp;
                      </h3>
                    </div>
                    <div>
                      {this.formatPopperLineItemOutflow(availableFunds.pendingRefunds)}
                    </div>
                  </div>
                )}
              {Boolean(availableFunds.resolvedIssuesQueuedForTransfer)
                && (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="text-muted mb-0">Upcoming Withdrawals:&nbsp;&nbsp;</h3>
                    </div>
                    <div>
                      {this.formatPopperLineItemOutflow(availableFunds.resolvedIssuesQueuedForTransfer)}
                    </div>
                  </div>
                )}
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="text-muted mb-0">Total Available:&nbsp;&nbsp;</h3>
                </div>
                <div>
                  {this.formatPopperLineItemInflow(availableFunds.totalAvailable)}
                </div>
              </div>
              {Boolean(availableFunds.totalCreditBalance)
                && (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="text-muted mb-0">Credit Limit:&nbsp;&nbsp;</h3>
                    </div>
                    <div>
                      <h2 className="font-light mb-0 text-end">
                        {numeral(Math.abs(availableFunds.totalCreditBalance)).format('$0,0.00')}
                      </h2>
                    </div>
                  </div>
                )}
              {Boolean(availableFunds.paymentCardsBalance)
                && (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="text-muted mb-0">Current Purchase Card Balance:&nbsp;&nbsp;</h3>
                    </div>
                    <div>
                      <h2 className="font-light mb-0 text-end">
                        {numeral(Math.abs(availableFunds.paymentCardsBalance)).format('$0,0.00')}
                      </h2>
                    </div>
                  </div>
                )}
            </PopoverBody>
          </Popover>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_widgets_availablefunds);
