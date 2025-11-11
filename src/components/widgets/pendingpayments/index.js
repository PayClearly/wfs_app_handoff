import { connect, Component } from 'component';

// Third Party Imports ...
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import numeral from 'numeral';

import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  pendingPayments: Selectors.payments(state).pendingPayments,
  virtualCardsBalanceRemaining: Selectors.cardsActivity(state).virtualCardsBalance.remaining,
  virtualCardsBalanceCount: Selectors.cardsActivity(state).virtualCardsBalance.count,
  cardsActivityLoaded: Selectors.cardsActivity(state).loaded,
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_widgets_pendingpayments extends Component {

  state = {
    popoverOpen: false,
  };

  _onClickToggleDetails = () => {
    this.setState((prevState) => ({ popoverOpen: !prevState.popoverOpen }));
  };

  render() {
    const {
      pendingPayments, virtualCardsBalanceRemaining, virtualCardsBalanceCount, cardsActivityLoaded,
    } = this.props;
    const loaded = !!(pendingPayments && cardsActivityLoaded);
    const pendingAmount = loaded && Utils.addDollars([pendingPayments.pendingAmount, -virtualCardsBalanceRemaining]);
    return (
      <div
        className="card widget-small components_widgets_pendingpayments"
        id="pending-payments-details"
        role="tooltip"
        onClick={loaded && this._onClickToggleDetails}
      >
        <div className="card-body">
          <h4 className="card-title">Pending
            <span className="text-nowrap">
              Payments<i className={`mdi mdi-chevron-${this.state.popoverOpen ? 'down' : 'right'}`} />
            </span>
          </h4>
          {loaded
            && (
              <div>
                <h2 className="font-light mb-0 text-truncate">{numeral(pendingAmount).format('$0,0.00')}</h2>
              </div>
            )}
          {!loaded
            && <Components.horizontalLoader />}
          {loaded
            && (
              <Popover
                placement={'bottom'}
                isOpen={this.state.popoverOpen}
                target={'pending-payments-details'}
                toggle={this._onClickToggleDetails}
                trigger="legacy"
                className="pending-popover-override"
              >
                <PopoverHeader className="popover-header-override">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="me-2">
                      Pending Payments Details
                    </div>
                    <div>
                      <i className="mdi mdi-close close" role="tooltip" onClick={this._onClickToggleDetails} />
                    </div>
                  </div>
                </PopoverHeader>
                <PopoverBody>
                  {pendingPayments
                    ? (
                      <>
                        <div className="text">
                          <span className="text-muted">Total Payments ({pendingPayments.pendingCount})</span>
                          <h2 className="font-light m-b-0">
                            <i className="ti-arrow-up text-success" />
                            {numeral(pendingPayments.pendingAmount).format('$0,0.00')}
                          </h2>
                          <span className="text-muted">Partial Virtual Card Balance ({virtualCardsBalanceCount})</span>
                          <h2 className="font-light m-b-0">
                            <i className="ti-arrow-up text-success" />
                            {numeral(virtualCardsBalanceRemaining).format('$0,0.00')}
                          </h2>
                        </div>
                        <div className="text float-start">
                          <span className="text-primary">Sent ({pendingPayments.sentCount})</span>
                        </div>
                        <div className="text float-end">
                          <span className="text-secondary">Scheduled ({pendingPayments.scheduledCount})</span>
                        </div>
                        <br />
                        <span className="text float-start w-70">
                          <span className="text-primary">
                            {numeral(pendingPayments.sentAmount).format('$0,0.00')}
                          </span>
                        </span>
                        <span className="text float-end w-30">
                          <span className="text-secondary">
                            {numeral(pendingPayments.scheduledAmount).format('$0,0.00')}
                          </span>
                        </span>
                        <div className="progress mb-3 mt-4" style={{ position: 'relative' }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{
                              position: 'absolute', left: '0px', width: `${(pendingPayments.sentAmount / pendingAmount) * 100}%`, height: '16px',
                            }}
                            aria-valuenow="25"
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                          <div
                            className="progress-bar bg-secondary"
                            role="progressbar"
                            style={{
                              position: 'absolute', right: '0px', width: `${(pendingPayments.scheduledAmount / pendingAmount) * 100}%`, height: '16px',
                            }}
                            aria-valuenow="25"
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </>
                    )
                    : <Components.loading />}
                </PopoverBody>
              </Popover>
            )}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_widgets_pendingpayments);
