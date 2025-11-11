import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    paymentCards: state.account.paymentCards.data.items,
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_overviews_paymentCardStatus extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  renderOverviewStatus = () => {
    const paymentCard = _try(() => this.props.paymentCards[this.props.id], {});
    const status = _try(() => paymentCard.status.split('_').reduce((acc, cur, index) => `${acc}${index > 0 ? ' ' : ''}${cur.charAt(0).toUpperCase()}${cur.slice(1)}`, ''), 'Pending');

    let statusColor;
    let message;
    let icon;
    let useDetailsHeader = true;

    if (paymentCard.status === 'cancelled') {
      statusColor = 'danger';
      icon = 'close';
      message = 'Purchase card has been cancelled. This action is irreversible, but you may create another purchase card if needed.';
      useDetailsHeader = !this.props.useSingleLineLayout;
    }
    if (paymentCard.status === 'active') {
      statusColor = 'primary';
      icon = 'check';
      message = false;
      useDetailsHeader = false;
    }
    if (paymentCard.status === 'on_hold') {
      statusColor = 'secondary';
      icon = 'progress-check';
      message = 'Purchase card is on hold. The card cannot be run by merchants until the status is reset to "Active."';
      useDetailsHeader = false;
    }
    if (paymentCard.status === 'pending') {
      statusColor = 'secondary';
      icon = 'progress-check';
      message = `${this.props.providerTheme.displayName} is processing your request to create a new purchase card. This may require you to fund your ${this.props.providerTheme.displayName} account, or take an additional action. Please see the Change Log for more information.`;
    }

    return (
      <div className={`status-message-container${this.props.useSingleLineLayout ? ' single-line-layout' : ''}`}>
        <div className="d-flex align-items-center mb-2">
          <div className={`main-icon-container bg-${statusColor} d-flex justify-content-center align-items-center`}>
            <i className={`mdi mdi-${icon} mdi-48px text-white`} />
          </div>
          <h1 className="mb-0 ms-3 status-header">{status}</h1>
        </div>
        {message &&
          <div className={`card border-${statusColor} small-padding${this.props.useSingleLineLayout ? ' ms-4' : ''}`}>
            {useDetailsHeader && <h5>{"What's going on?"}</h5>}
            <p className="m-0">{message}</p>
          </div>
        }
      </div>
    );
  }

  render() {
    return (
      <div className="components_overviews_paymentCardStatus">
        {this.renderOverviewStatus()}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_paymentCardStatus);


