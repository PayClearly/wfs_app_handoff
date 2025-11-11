import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';
import { PopoverHeader, PopoverBody } from 'reactstrap';

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    paymentStatuses: state.account.paymentStatuses.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
    goToPaymentHistory: (routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo('history', routeParams, routeOptions));
    },
  });
};

class components_tables_paymentchippopover extends Component {

  state = {
    paymentStatus: {},
  }

  componentDidMount() {
    const { refId, paymentStatuses } = this.props;
    const paymentStatus = paymentStatuses[refId];
    const amount = paymentStatus.created.amount;
    const date = paymentStatus.created._at;
    const to = _try(() => paymentStatus.verified.vendor.name) || 'undefined';
    const forMemo = _try(() => paymentStatus.created.memo) || 'General Payment';
    const customMemo = _try(() => paymentStatus.created.customFields.Memo) || 'N/A';
    this.setState({
      paymentStatus: {
        ...paymentStatus,
        amount,
        date,
        to,
        forMemo,
        customMemo,
      },
    });
  }


  navigateToDetails = () => {
    const paymentId = this.state.paymentStatus._id || null;
    this.props.closeModal();
    this.props.goToPaymentHistory({ npi: paymentId });
  }

  checkStatus = () => {
    const { paymentStatus } = this.state;
    let _status = paymentStatus.status || 'Scheduled';
    if (paymentStatus._status === 'cancelled') {
      _status = 'Cancelled';
    }
    return {
      primary: _status,
      sub: paymentStatus.substatus,
    };
  }

  render() {
    const { amount, date, to, forMemo, customMemo } = this.state.paymentStatus;
    return (
      <div className="components_tables_paymentchippopover">
        <PopoverHeader className="chip-popover-header">
          <span>
            <i className="mdi mdi-cash-multiple me-1" />
            Payment Details
          </span>
          <i role="tooltip" className="mdi mdi-link float-end" onClick={this.navigateToDetails} />
        </PopoverHeader>
        <PopoverBody>
          <table>
            <tr>
              <td className="me-3">Status:</td>
              <td><Components.badges.pipelinestatus data={this.checkStatus()} /></td>
            </tr>
            <tr>
              <td>Amount:</td>
              <td>{numeral(amount).format('$0,0.00')}</td>
            </tr>
            <tr>
              <td>Date:</td>
              <td>{Utils.dates.dateToDay(date)}</td>
            </tr>
            <tr>
              <td>To:</td>
              <td>{to}</td>
            </tr>
            <tr>
              <td>For:</td>
              <td>{forMemo}</td>
            </tr>
            <tr>
              <td>Memo:</td>
              <td>{customMemo}</td>
            </tr>
          </table>
        </PopoverBody>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_paymentchippopover);


