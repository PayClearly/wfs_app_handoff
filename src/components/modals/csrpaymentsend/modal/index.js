import {
  connect, Component, Fragment,
} from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  paymentStatuses: state.account.paymentStatuses,
  userId: state.user.access.data.uid,
});

const mapDispatchToProps = (dispatch) => ({
  markPaymentBeingHandled: (id, params) => {
    dispatch(Store.account.updatePaymentPipelines([id], 'beingHandledBy', params));
  },
});

class components_modals_csrpaymentsend_modal extends Component {

  componentDidMount() {
    this.props.markPaymentBeingHandled(this.props.id);
  }

  componentWillReceiveProps(nextProps) {
    const paymentStatus = nextProps.paymentStatuses.data.items[nextProps.id];
    const paymentSent = paymentStatus.sent && paymentStatus.sent.markedAsReadyToSendOrSent;
    const beingHandledBy = paymentStatus.sent && paymentStatus.sent.beingHandledBy;
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
      <Fragment>
        {(() => {
          if (paymentStatus.created.method === 'ACH') {
            if (paymentStatus.verified?.achDeliveryMethod === 'pullAch') {
              return (
                <Components.modals.csrpaymentsend.components.virtualcardview
                  id={this.props.id}
                  close={this.props.close}
                />
              );
            }
            return (
              <Components.modals.csrpaymentsend.components.achview
                id={this.props.id}
                close={this.props.close}
              />
            );
          }

          if (paymentStatus.created.method === 'check') {
            return (
              <Components.modals.csrpaymentsend.components.checkview
                id={this.props.id}
                close={this.props.close}
              />
            );
          }

          if (paymentStatus.created.method === 'vCard') {
            return (
              <Components.modals.csrpaymentsend.components.virtualcardview
                id={this.props.id}
                close={this.props.close}
              />
            );
          }

          return (
            <Components.modals.csrpaymentsend.components.virtualcardview
              id={this.props.id}
              close={this.props.close}
            />
          );
        })()}
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_csrpaymentsend_modal);


