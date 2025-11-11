import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    fundingDetails: Selectors.funding(state),
    transfersPolicies: Selectors.entity('achTransfers_idOrganization_idAccount')(state),
    fundingIntegrationPolicies: Selectors.entity('achAccountCredentials_idOrganization_idAccount')(state),
    featureFlag: Selectors.featureFlags(state).manualDeposits,
    providerDisplayName: Selectors.providerTheme(state).displayName,
    creatingError: _resolve(state, 'account.achTransfers.status.creatingError'),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openFundingModal: (data) => {
      return dispatch(Store.router.openModal('Components.modals.funding', data));
    },
    openManualFundingModal: (data) => {
      return dispatch(Store.router.openModal('Components.modals.createTransfer', data));
    },
    navigateTo: (routeName, routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo(routeName, routeParams, routeOptions));
    },
  });
};

class components_funding_deposits extends Component {
  componentDidMount() {}
  componentWillUnmount() {}

  renderDepositMessage = () => {
    const { fundingDetails, providerDisplayName } = this.props;
    return (
      <span>
        <Components.tooltip
          className="d-inline m-0"
          placement="right"
        >
          <div className="d-inline-block">
            <div className="d-flex align-items-center message-container">
              <span className="text">{_generateDepositMessage(fundingDetails, providerDisplayName)}&nbsp;&nbsp;</span><i className="mdi mdi-help-circle-outline mdi-24px text-primary" />
            </div>
          </div>
          <div>{_generateTooltipMessage(fundingDetails, providerDisplayName)}</div>
        </Components.tooltip>
      </span>
    );
  }

  render() {
    const { fundingDetails, transfersPolicies, fundingIntegrationPolicies, featureFlag, providerDisplayName } = this.props;
    const hasTransferPool = Boolean(_try(() => fundingDetails.currentTransferPool));
    const fundingAccountLinked = _try(() => fundingDetails.achAccountLinked);

    const actionContent = [];
    actionContent.push({
      title: 'View Funding Details',
      onClick: () => {
        this.props.openFundingModal();
      },
    });

    if (!_try(() => fundingDetails.achAccountLinked) && fundingIntegrationPolicies.canCreate) {
      actionContent.push({
        title: 'Configure Funding Settings',
        onClick: () => {
          this.props.navigateTo('account');
        },
      });
    }
    
    if (_try(() => fundingDetails.achAccountLinked) && transfersPolicies.canCreate && featureFlag) {
      actionContent.push({
        title: 'Create Manual Deposit',
        onClick: () => {
          this.props.openManualFundingModal();
        },
      });
    }

    actionContent.push({
      title: 'Cancel',
      onClick: () => {},
    });

    return (
      <div
        className="components_funding_deposits h-100 w-100 card card-with-label"
      >
        <p className="card-label px-1"><strong>Virtual Card Deposits</strong></p>
        {!this.props.hideActions && !!actionContent.length &&
          <Components.actionsButton
            containerClassNames={'action-button-container pb-1'}
            id={'deposit-actions'}
            actionContent={actionContent}
            buttonClassNames="btn btn-primary btn-sm"
          />
        }
        <div className="card-body d-flex flex-column justify-content-around">
          <div className="d-flex justify-content-center align-items-center">
            <h1 className="text-primary m-0"><i className="mdi mdi-inbox-arrow-down bound-icon text-primary" /> {numeral(_try(() => this.props.fundingDetails.currentTransferPool) || 0).format('$0,0.00')}</h1>
          </div>
          {hasTransferPool &&
            <Fragment>
              <div>
                <hr />
              </div>
              <div className={`d-flex justify-content-between align-items-center${this.props.inModal ? ' flex-container' : ''}`}>
                <h5 className="text-muted m-0 left">
                  {this.renderDepositMessage()}
                </h5>
                <div className={this.props.inModal && 'center'}>
                  { hasTransferPool && fundingAccountLinked &&
                    <Components.initiateTransferButton />
                  }
                </div>
                { this.props.inModal && hasTransferPool && fundingAccountLinked &&
                  <div className={this.props.inModal && 'right'} />
                }
              </div>
              { this.props.creatingError &&
                <div className="alert alert-danger mt-2" role="alert">
                  {this.props.creatingError}
                </div>
              }
            </Fragment>
          }
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_funding_deposits);

// Internal Helper Functions ... 
const _generateDepositMessage = (fundingDetails, providerDisplayName) => {
  if (!fundingDetails.achAccountLinked) {
    return (
      <span>Not configured with {providerDisplayName} funding tools.</span>
    );
  }

  let type = 'Standard';
  let autoFunding = 'Manual';

  if (fundingDetails.earmarkEnforced) type = 'Batch Based';
  if (fundingDetails.automaticFundingEnabled && fundingDetails.automaticFundingType === 'eod') autoFunding = 'End-Of-Day';
  if (fundingDetails.automaticFundingEnabled && fundingDetails.automaticFundingType === 'payment') autoFunding = 'Instant';

  return <span>{type} {autoFunding} Funding</span>;
};

const _generateTooltipMessage = (fundingDetails, providerDisplayName) => {
  if (!fundingDetails.achAccountLinked) {
    return (
      <span><strong>Funds are needed</strong> but this account has not been configured with {providerDisplayName} funding tools.</span>
    );
  }

  if (!fundingDetails.automaticFundingEnabled) {
    return (
      <span>Automatic funding has not been set up for this account, <strong>manually create a transfer</strong> for the displayed amount in order to fund payments.</span>
    );
  }

  if (fundingDetails.automaticFundingType === 'eod') {
    const now = new Date();
    const efsTimezoneNowTime = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false });

    let date;
    let isToday;
    let isTomorrow;

    if (_dateIsWeekend(now)) {
      date = new Date(now);

      while (_dateIsWeekend(date)) {
        date.setDate(date.getDate() + 1);
      }
    } else {
      const cutoffWindow = ['16:55:00', '17:00:00'];
      const nowIsBeforeCutoffWindowStart = _timeIsBefore(efsTimezoneNowTime, cutoffWindow[0]);
      
      if (nowIsBeforeCutoffWindowStart) {
        date = now;
        isToday = true;
      } else {
        date = new Date(now);
        if (date.getUTCDay() === 5) {
          date.setDate(date.getDate() + 3);
        } else {
          date.setDate(date.getDate() + 1);
          isTomorrow = true;
        }
      }
    }

    return (
      <span>A deposit transfer for the displayed amount will be created {_generateEODMessage(date, isToday, isTomorrow)}</span>
    );
  }

  if (fundingDetails.automaticFundingType === 'payment') {
    return (
      <span>Deposit transfers for this account are automatically generated upon payment creation. There is, however, a <strong>residual deposit balance</strong> that will be addressed when the next payment is created</span>
    );
  }
};

function _generateEODMessage(date, isToday, isTomorrow) {
  if (isToday) {
    return (
      <span><strong>today</strong>, {date.toLocaleDateString('en-US', { timeZone: 'America/New_York', hour12: false })}, at <strong>4:55 PM ET</strong>.</span>
    );
  } else if (isTomorrow) {
    return (
      <span><strong>tomorrow</strong>, {date.toLocaleDateString('en-US', { timeZone: 'America/New_York', hour12: false })}, at <strong>4:55 PM ET</strong>.</span>
    );
  }
  return (
    <span><strong>on Monday</strong>, {date.toLocaleDateString('en-US', { timeZone: 'America/New_York', hour12: false })}, at <strong>4:55 PM ET</strong>.</span>
  );
}

function _timeIsBefore(time, referenceTime) {
  const timeSplit = time.split(':');
  const timeHour = parseInt(timeSplit[0], 10);
  const timeMinutes = parseInt(timeSplit[1], 10);
  const timeSeconds = parseInt(timeSplit[2], 10);

  const referenceTimeSplit = referenceTime.split(':');
  const referenceHour = parseInt(referenceTimeSplit[0], 10);
  const referenceMinutes = parseInt(referenceTimeSplit[1], 10);
  const referenceSeconds = parseInt(referenceTimeSplit[2], 10);

  return ((timeHour < referenceHour) || (timeHour === referenceHour && timeMinutes < referenceMinutes) || (timeHour === referenceHour && timeMinutes === referenceMinutes && timeSeconds < referenceSeconds));
}

function _dateIsWeekend(now) {
  const dayOfWeek = now.getUTCDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

// GENERATOR_TYPE='component';
