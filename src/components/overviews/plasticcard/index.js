import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';
// import { Collapse } from 'react-collapse';

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    users: _resolve(state, 'users.data.items'),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openTransactionHistoryModal: (id) => {
      return dispatch(Store.router.openModal('Components.modals.transactionhistory', { id }));
    },
  });
};

class components_overviews_plasticcard extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  renderCycleLimits = ({ cycleIndicator, cycleRefreshDay, cycleRefreshDate, cycleTransactionAmountLimit, cycleTransactionAmountUsed, cycleTransactionCountLimit, cycleTransactionCountUsed }) => {
    if (cycleIndicator === 'N') {
      return (
        <div className="col-12">
          <strong>Cycle Limit</strong>
          <p className="text-muted mb-2">No Limit</p>
        </div>
      );
    }

    return (
      <Fragment>
        <div className="col-12 col-md-4">
          <strong>{_cycleMap[cycleIndicator]} Refresh {cycleIndicator === 'M' ? 'Date' : 'Day'}</strong>
          <p className="text-muted mb-2">{`${_cycleRefreshDayMap[cycleRefreshDay] || cycleRefreshDay}${cycleRefreshDate ? ` (Last refreshed on: ${_formatDate(cycleRefreshDate)})` : ''}`}</p>
        </div>
        <div className="col-12 col-md-4">
          <strong>{_cycleMap[cycleIndicator]} Transaction Amount Limit</strong>
          {
            cycleTransactionAmountLimit
              ? <p className="text-muted mb-2">{_formatAmount(cycleTransactionAmountUsed || 0)} / {_formatAmount(cycleTransactionAmountLimit || 0)}</p>
              : <p className="text-muted mb-2">No Limit</p>
          }
        </div>
        <div className="col-12 col-md-4">
          <strong>{_cycleMap[cycleIndicator]} Transaction Count Limit</strong>
          {
            cycleTransactionCountLimit
              ? <p className="text-muted mb-2">{cycleTransactionCountUsed || 0} / {cycleTransactionCountLimit || 0}</p>
              : <p className="text-muted mb-2">No Limit</p>
          }
        </div>
      </Fragment>
    );
  }

  renderDailyLimits = ({ dailyTransactionAmountLimit, dailyTransactionAmountUsed, dailyTransactionCountLimit, dailyTransactionCountUsed }) => {
    return (
      <Fragment>
        <div className="col-12 col-md-4">
          <strong>Daily Transaction Amount Limit</strong>
          {
            dailyTransactionAmountLimit
              ? <p className="text-muted mb-2">{_formatAmount(dailyTransactionAmountUsed || 0)} / {_formatAmount(dailyTransactionAmountLimit || 0)}</p>
              : <p className="text-muted mb-2">No Limit</p>
          }
        </div>
        <div className="col-12 col-md-4">
          <strong>Daily Transaction Count Limit</strong>
          <p className="text-muted mb-2">{dailyTransactionCountUsed || 0} / {dailyTransactionCountLimit || 0}</p>
        </div>
      </Fragment>
    );
  }

  render() {
    const { data, users = {} } = this.props;
    const {
      cardHolderName,
      cardMemo,
      cardGroup,
      cardLast4,
      cardNumberLastFour,
      region,
      status,
      transactionLimit,
      contactName,
      addressLine,
      city,
      stateProv,
      postalCode,
      country,
      cardType,
      phoneNumber,
      rushOrder,
      _createdAt,
      id,
      assignedTo,
    } = data;
    const user = users[assignedTo];
    let displayName;
    if (user) {
      displayName = (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : user.email;
    }

    return (
      <div className="components_overviews_plasticcard">

        <h2>Details</h2>
        <div className="row pt-2 pb-4">
          <div className="col-12 col-md-4">
            <strong>Card Holder Name</strong>
            <p className="text-muted mb-2">{cardHolderName}</p>
          </div>
          <div className="col-12 col-md-4">
            <strong>Last 4</strong>
            <p className="text-muted mb-2">{_formatLastFour(cardLast4 || cardNumberLastFour)}</p>
          </div>
          <div className="col-12 col-md-4">
            <strong>Valid Through</strong>
            <p className="text-muted mb-2">{_formatExpireDate(data)}</p>
          </div>
          <div className="col-12 col-md-4">
            <strong>Region</strong>
            <p className="text-muted mb-2">{region}</p>
          </div>
          <div className="col-12 col-md-4">
            <strong>Status</strong>
            <p className="text-muted mb-2">{_formatStatus(status)}</p>
          </div>
          <div className="col-12 col-md-4">
            <strong>Card Type</strong>
            <p className="text-muted mb-2">{cardType}</p>
          </div>
          <div className="col-12 col-md-4">
            <strong>Card Memo</strong>
            <p className="text-muted mb-2">{cardMemo}</p>
          </div>
          <div className="col-12 col-md-4">
            <strong>Card Group</strong>
            <p className="text-muted mb-2">{cardGroup}</p>
          </div>
          <div className="col-12 col-md-4">
            <strong>Created</strong>
            <p className="text-muted mb-2">{Utils.dates.dateToDay(_createdAt || Date.now())}</p>
          </div>
          {assignedTo ?
            <div className="col-12 col-md-4">
              <strong>Assigned To</strong>
              <p className="text-muted mb-2">{displayName || ''}</p>
            </div>
            : null
          }
        </div>

        <h2>Limits</h2>
        <div className="row pt-2 pb-4">
          <div className="col-12 col-md-4">
            <strong>Total Amount Limit:</strong>
            <p className="text-muted mb-2">{transactionLimit === 0 ? 'No Limit' : _formatAmount(transactionLimit)}</p>
          </div>
          {
            this.renderDailyLimits(data)
          }
          {
            this.renderCycleLimits(data)
          }
        </div>

        <Components.forms.components.accordion
          showLabel="Show Delivery Details"
          hideLabel="Hide Delivery Details"
          leftAligned
        >
          <h2>Delivery Details</h2>
          <div className="row pt-2 pb-4">
            <div className="col-12">
              <strong>Contact Name</strong>
              <p className="text-muted mb-2">{contactName}</p>
            </div>
            <div className="col-12">
              <strong>Address Line</strong>
              <p className="text-muted mb-2">{addressLine}</p>
            </div>
            <div className="col-12 col-md-4">
              <strong>City</strong>
              <p className="text-muted mb-2">{city}</p>
            </div>
            <div className="col-12 col-md-4">
              <strong>State / Province</strong>
              <p className="text-muted mb-2">{stateProv}</p>
            </div>
            <div className="col-12 col-md-4">
              <strong>Zip Code</strong>
              <p className="text-muted mb-2">{postalCode}</p>
            </div>
            <div className="col-12 col-md-4">
              <strong>Country</strong>
              <p className="text-muted mb-2">{country}</p>
            </div>
            <div className="col-12 col-md-4">
              <strong>Phone Number</strong>
              <p className="text-muted mb-2">{phoneNumber}</p>
            </div>
            <div className="col-12 col-md-4">
              <strong>Rush Order</strong>
              <p className="text-muted mb-2">{_rushOrderMap[rushOrder]}</p>
            </div>
          </div>
        </Components.forms.components.accordion>
        <button
          className="btn btn-secondary left"
          type="button"
          onClick={() => this.props.openTransactionHistoryModal(id)}
        >
          View Card Transactions
        </button>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_plasticcard);

// Internal Helper Functions ...
const _cycleMap = {
  N: 'None',
  W: 'Weekly',
  M: 'Monthly',
};

const _cycleRefreshDayMap = {
  MO: 'Monday',
  TU: 'Tuesday',
  WE: 'Wednesday',
  TH: 'Thursday',
  FR: 'Friday',
  SA: 'Saturday',
  SU: 'Sunday',
};

const _rushOrderMap = {
  '1': 'No Rush Order',
  '2': 'Same Day Processing / Overnight Shipping',
  '3': 'Standard Processing / Overnight Shipping',
};


const _formatLastFour = (lastFour) => {
  return `*${numeral(lastFour).format('0000')}`;
};

const _formatAmount = (amount) => {
  return `${numeral(amount).format('$0,0.00')}`;
};

const _formatStatus = (status) => {
  return `${status.split('_').reduce((acc, cur, index) => `${acc}${index > 0 ? ' ' : ''}${cur.charAt(0).toUpperCase()}${cur.slice(1)}`, '')}`;
};

const _formatDate = (date) => {
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
};

const _formatExpireDate = ({ expireDate, newExpireDate }) => {
  if (!expireDate || expireDate === '0') return 'Processing...';
  return `${expireDate.slice(4, 6)}-${expireDate.slice(0, 4)}`;
};

// GENERATOR_TYPE='component';
