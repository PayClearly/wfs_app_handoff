import { connect, Component, bindActionCreators, Fragment } from 'component';
import { Collapse } from 'react-collapse';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    paymentCards: state.account.paymentCards.data.items,
    cardsActivity: _try(() => Selectors.cardsActivity(state), {}),
    cardsIntegrationUpdating: _try(() => state.account.cardsIntegration.status.updating),
    account: state.account.data.id,
    organization: state.organization.data.id,
    accounts: state.accounts.data.items,
    paymentCardChangeRequestsByPaymentCard: Selectors.paymentCardChangeRequests(state).requestsByPaymentCard,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openVirtualCardModal: (id, name) => {
      return dispatch(Store.router.openModal('Components.modals.virtualcard', { id, name })); 
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({
    cardType: `state/links/cardsIntegration/${props.organization}/${props.account}/resources/vCards/${props.paymentCards[props.id].vCard}/cardType`,
  });
};

class components_overviews_paymentCard extends Component {
  state = {
    changeLogOpen: false,
    customFieldsOpen: false,
    triggerOpen: false,
    tableKey: 'paymentCardOverview',
  }

  componentDidMount() {}
  componentWillUnmount() {}

  handleCollapseClick = (type) => {
    this.setState((prevState) => {
      return {
        [`${type}Open`]: !prevState[`${type}Open`],
      };
    });
  }

  render() {
    const { id, paymentCards, cardsActivity, accounts, account, cardType } = this.props;
    const paymentCard = paymentCards[id] || {};
    const transactionInformation = _try(() => cardsActivity.totalsByCard[paymentCard.vCard], {});
    const hasVirtualCard = Boolean(paymentCard.vCard);
    const { totalAuthorized } = _try(() => transactionInformation, {});
    const logo = _try(() => accounts[account].virtualCardLogo);

    const remainingTriggers = (paymentCard.trigger && Object.keys(paymentCard.trigger).length > 0)
      ? Math.floor((999999999.99 - totalAuthorized) / (paymentCard.trigger.max - (paymentCard.trigger.min || 0)))
      : null;

    return (
      <div className="components_overviews_paymentCard">
        <div className="row">
          <div className="col-12 col-md-7 status-column">
            <div className={`card card-with-label status-card${hasVirtualCard ? ' has-vCard' : ''}`}>
              <p className="card-label px-1"><strong>Status</strong></p>
              <div className="card-body">
                <Components.overviews.paymentCardStatus id={id} useSingleLineLayout={hasVirtualCard} />
              </div>
            </div>
            {hasVirtualCard &&
              <div className={`card card-with-label vCard-card mt-3${hasVirtualCard ? ' has-vCard' : ''}`}>
                <p className="card-label px-1"><strong>Card</strong></p>
                <div className="card-body virtualCardContainer">
                  <div className="virtualCard">
                    <Components.virtualcard
                      blur
                      factor={1.2}
                      onClick={hasVirtualCard ? () => { this.props.openVirtualCardModal(paymentCard.vCard, paymentCard.name); } : null}
                      logo={logo}
                      cardType={cardType}
                    />
                  </div>
                  <div className="virtualCardLink"><a>click to view</a></div>
                </div>
              </div>
            }
          </div>
          <div className="col-12 col-md-5">
            <div className="card card-with-label details-card mt-3 mt-md-0">
              <p className="card-label px-1"><strong>Details</strong></p>
              <div className="card-body">
                <Components.overviews.paymentCardDetails id={id} />
              </div>
            </div>
          </div>
        </div>
        { paymentCard.trigger && Object.keys(paymentCard.trigger).length &&
          <Fragment>
            <div className="">
              <h4 className="m-0 py-3 d-inline-block collapse-header" onClick={() => { this.handleCollapseClick('trigger'); }}><i className={`mdi mdi-menu-right${this.state.triggerOpen ? ' rotate90 inline-rotate' : ''}`} />  Trigger Details</h4>
              <Collapse isOpened={this.state.triggerOpen}>
                {remainingTriggers < 6 &&
                <div className="row">
                  <div className="col-12" >
                    <h6 className="alert alert-danger">You have <strong>{remainingTriggers}</strong> funding triggers left before this card reaches its maximum limit of $999,999,999.99</h6>
                  </div>
                </div>}
                <div className="row">
                  <div className="col-12 col-md-4">
                    <strong>Trigger Type</strong>
                    <p className="text-muted mb-2">{paymentCard.trigger.type === 'threshold' ? 'Threshold' : 'Subscription'}</p>
                  </div>
                  {paymentCard.trigger.type === 'threshold' &&
                    <div className="col-12 col-md-4">
                      <strong>Minimum Balance Threshold</strong>
                      <p className="text-muted mb-2">{Utils.numeral()(paymentCard.trigger.min).format('$0,0.00')}</p>
                    </div>
                  }
                  {paymentCard.trigger.type === 'periodic' &&
                    <div className="col-12 col-md-4">
                      <strong>Subscription Frequency</strong>
                      <p className="text-muted mb-2">{paymentCard.trigger.frequency.charAt(0).toUpperCase() + paymentCard.trigger.frequency.slice(1)}</p>
                    </div>
                  }
                  {paymentCard.trigger.type === 'periodic' && paymentCard.trigger.frequency !== 'daily' &&
                    <div className="col-12 col-md-4">
                      <strong>{(paymentCard.trigger.frequency === 'annually' && 'Month') || (paymentCard.trigger.frequency === 'monthly' && 'Day of Month') || (paymentCard.trigger.frequency === 'weekly' && 'Day of Week')}</strong>
                      <p className="text-muted mb-2">{_specificDateToOverview(paymentCard.trigger)}</p>
                    </div>
                  }
                  <div className="col-12 col-md-4">
                    <strong>Target Remaining Balance</strong>
                    <p className="text-muted mb-2">{Utils.numeral()(paymentCard.trigger.max).format('$0,0.00')}</p>
                  </div>
                  {paymentCard.trigger.type === 'periodic' &&
                    <div className="col-12 col-md-4">
                      <strong>Next Trigger</strong>
                      <p className="text-muted mb-2">{new Date(paymentCard.trigger._nextTriggerAt).toDateString()}</p>
                    </div>
                  }
                </div>
              </Collapse>
            </div>
            <hr className="m-0" />
          </Fragment>
        }
        { paymentCard.customFields && Object.keys(paymentCard.customFields).some((field) => { return paymentCard.customFields[field]; }) &&
          <Fragment>
            <div>
              <h4 className="m-0 py-3 d-inline-block collapse-header" onClick={() => { this.handleCollapseClick('customFields'); }}><i className={`mdi mdi-menu-right${this.state.customFieldsOpen ? ' rotate90 inline-rotate' : ''}`} />  Custom Fields</h4>
              <Collapse isOpened={this.state.customFieldsOpen}>
                <div className="row">
                  { Object.keys(paymentCard.customFields).map((field) => {
                    return (
                      <div className="col-12 col-md-4">
                        <strong>{field}</strong>
                        <p className="text-muted mb-2">{paymentCard.customFields[field]}</p>
                      </div>
                    );
                  })
                  }
                </div>
              </Collapse>
            </div>
            <hr className="m-0" />
          </Fragment>
        }
        {_try(() => Object.keys(this.props.paymentCardChangeRequestsByPaymentCard[id]).length) &&
          <Fragment>
            <div>
              <h4 className="m-0 py-3 d-inline-block collapse-header" onClick={() => { this.handleCollapseClick('changeLog'); }}><i className={`mdi mdi-menu-right${this.state.changeLogOpen ? ' rotate90 inline-rotate' : ''}`} />  Change Log</h4>
              <Collapse isOpened={this.state.changeLogOpen}>
                <div className="pb-2">
                  <Components.tables.paymentCardChangeRequests
                    tableKey={this.state.tableKey}
                    initialTableStateOverride={{
                      filters: [{ key: 'paymentCardId', type: 'string', comparator: 'equals', value: paymentCard.id }],
                    }}
                    nestedTable
                  />
                </div>
              </Collapse>
            </div>
            <hr className="m-0" />
          </Fragment>
        }
        {this.props.disabledEditClicked &&
          <span className="text-nowrap text-danger mdi mdi-alert-circle small">
            &nbsp;Cannot edit purchase card with an active change in progress. Please cancel current change to make edits.
          </span>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_overviews_paymentCard);

// Internal Helper Functions ... 

function _specificDateToOverview(trigger) {
  switch (trigger.frequency) {
    case 'annually':
      return MONTH_OPTIONS[trigger.specificDate];

    case 'weekly':
      return DAY_OF_WEEK_OPTIONS[trigger.specificDate];
    
    default:
      return `${trigger.specificDate}${Utils.dates.generateDateSuffixes(trigger.specificDate)}`;
  }
}

const DAY_OF_WEEK_OPTIONS = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
};

const MONTH_OPTIONS = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec',
};

// GENERATOR_TYPE='component';
