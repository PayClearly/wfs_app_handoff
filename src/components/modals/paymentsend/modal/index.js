import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    paymentStatuses: state.account.paymentStatuses,
    userId: state.user.access.data.uid,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    markPaymentBeingHandled: (id, params) => {
      dispatch(Store.account.updatePaymentPipelines([id], 'beingHandledBy', params));
    },
  });
};

class components_modals_paymentsend_modal extends Component {

  componentDidMount() {
    this.props.markPaymentBeingHandled(this.props.id);
  }

  componentWillReceiveProps(nextProps) {
    const paymentStatus = nextProps.paymentStatuses.data.items[nextProps.id];
    const paymentSent = paymentStatus.sent && (_try(() => paymentStatus.sent.markedAsReadyToSendOrSent) || !_try(() => paymentStatus.sent.waitingToBeMarkedAsSent));
    const beingHandledBy = paymentStatus.sent && paymentStatus.beingHandledBy;
    if (paymentSent || (beingHandledBy && beingHandledBy !== nextProps.userId) || paymentStatus._status === 'cancelled') {
      this.props.close();
    }
  }

  componentWillUnmount() {
    this.props.markPaymentBeingHandled(this.props.id, { clear: true });
  }

  render() {
    const paymentStatus = this.props.paymentStatuses.data.items[this.props.id];

    return (
      <div className="components_modals_paymentsend_modal">
        {(() => {
          if (paymentStatus.created.method === 'check') {
            return (
              <Components.modals.paymentsend.components.checkview
                id={this.props.id}
                close={this.props.close}
              />
            );
          }

          if (paymentStatus.created.method === 'vCard') {
            return (
              <Components.modals.paymentsend.components.virtualcardview
                id={this.props.id}
                close={this.props.close}
              />
            );
          }

          if (paymentStatus.created.method === 'ACH') {
            return (
              <Components.modals.paymentsend.components.achview
                id={this.props.id}
                close={this.props.close}
              />
            );
          }

          return (
            <Components.modals.paymentsend.components.virtualcardview
              id={this.props.id}
              close={this.props.close}
            />
          );
        })()}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_paymentsend_modal);

