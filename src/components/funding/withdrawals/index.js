import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    fundingDetails: Selectors.funding(state),
    transfersPolicies: Selectors.entity('achTransfers_idOrganization_idAccount')(state),
    fundingIntegrationPolicies: Selectors.entity('achAccountCredentials_idOrganization_idAccount')(state),
    featureFlag: Selectors.featureFlags(state).manualWithdrawals,
    providerDisplayName: Selectors.providerTheme(state).displayName,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openWithdrawalsModal: (data) => {
      return dispatch(Store.router.openModal('Components.modals.withdrawals', data));
    },
    openManualFundingModal: (data) => {
      return dispatch(Store.router.openModal('Components.modals.createTransfer', data));
    },
    navigateTo: (routeName, routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo(routeName, routeParams, routeOptions));
    },
  });
};

class components_funding_withdrawals extends Component {

  componentDidMount() {}
  componentWillUnmount() {}

  renderWithdrawalMessage = () => {
    const { fundingDetails, providerDisplayName } = this.props;
    return _generateWithdrawalMessage(fundingDetails, providerDisplayName);
  }

  render() {
    const { fundingDetails, transfersPolicies, fundingIntegrationPolicies, featureFlag } = this.props;
    const hasPendingWithdrawals = Boolean(_try(() => fundingDetails.currentPendingWithdrawalTotal));

    const actionContent = [];
    if (hasPendingWithdrawals) {
      actionContent.push({
        title: 'View Withdrawal Details',
        onClick: () => {
          this.props.openWithdrawalsModal();
        },
      });
    }

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
        title: 'Create Manual Withdrawal',
        onClick: () => {
          this.props.openManualFundingModal({
            title: 'Withdraw Funds Manually',
            message: `You may elect to manually withdraw funds out of your ${this.props.providerDisplayName} account. Please be aware that this is not recommended as our systems already monitor the status of your account and will notify you regarding funding if needed. If you have any questions about funding, please reach out to the ${this.props.providerDisplayName} support team.`,
            withdrawal: true,
          });
        },
      });
    }

    actionContent.push({
      title: 'Cancel',
      onClick: () => {},
    });
    return (
      <div 
        className="components_funding_withdrawals h-100 w-100 card card-with-label"
      >
        <p className="card-label px-1"><strong>Pending Withdrawals</strong></p>
        {!this.props.hideActions && !!actionContent.length &&
          <Components.actionsButton
            containerClassNames={'action-button-container pb-1'}
            id={'withdrawal-actions'}
            actionContent={actionContent}
            buttonClassNames="btn btn-secondary btn-sm"
          />
        }
        <div className="card-body d-flex flex-column justify-content-around">
          <div className="d-flex justify-content-center align-items-center">
            <h1 className="text-secondary m-0"><i className="mdi mdi-inbox-arrow-up bound-icon text-secondary" /> {numeral(_try(() => this.props.fundingDetails.currentPendingWithdrawalTotal) || 0).format('$0,0.00')}</h1>
          </div>
          {hasPendingWithdrawals &&
            <Fragment>
              <div>
                <hr />
              </div>
              <div>
                <h5 className="text-muted">
                  {this.renderWithdrawalMessage()}
                </h5>
              </div>
            </Fragment>
          }
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_funding_withdrawals);

// Internal Helper Functions ... 
const _generateWithdrawalMessage = (fundingDetails, providerDisplayName) => {
  if (!fundingDetails.achAccountLinked) {
    return (
      <span><strong>Withdrawals are pending</strong> but this account has not been configured with {providerDisplayName} funding tools.</span>
    );
  }
  const now = new Date();
  const efsTimezoneNowTime = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false });

  const cutoffTime = '11:00:00';
  const nowIsBeforeCutoffTime = _timeIsBefore(efsTimezoneNowTime, cutoffTime);
  const date = new Date();
  const dayOfWeek = date.getDay();
  let nextTuesday;
  if (dayOfWeek === 0 || dayOfWeek > 2 || (dayOfWeek === 2 && !nowIsBeforeCutoffTime)) nextTuesday = _findNextTuesday(date);
  
  let timeMessage;
  switch (true) {
    case dayOfWeek === 1:
      timeMessage = `tomorrow, ${(_addOneDay(date)).toLocaleDateString('en-US')}, at 11:00 AM ET.`;
      break;
    case dayOfWeek === 2 && nowIsBeforeCutoffTime:
      timeMessage = `today, ${date.toLocaleDateString('en-US')}, at 11:00 AM ET.`;
      break;
    default:
      timeMessage = `on Tuesday, ${nextTuesday.toLocaleDateString('en-US')}, at 11:00 AM ET.`;
      break;
  }
  
  return (
    <span>Pending withdrawals will automatically be initiated {timeMessage}</span>
  );
};

function _addOneDay(date) {
  const copy = new Date(date.getTime());
  copy.setDate(date.getDate() + 1);
  return copy;
}

function _findNextTuesday(date) {
  let copy = date.getDay() === 2 ? _addOneDay(date) : new Date(date.getTime());

  while (copy.getDay() !== 2) {
    copy = _addOneDay(copy);
  }
  return copy;
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

// GENERATOR_TYPE='component';
