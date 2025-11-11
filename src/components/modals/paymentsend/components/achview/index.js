import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Store from 'store';
import Selectors from 'selectors';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    providerTheme: Selectors.providerTheme(state),
    paymentStatuses: state.account.paymentStatuses,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    markPaymentAsSent: (id, params) => {
      dispatch(Store.account.updatePaymentPipelines([id], 'markAsSent', params));
    },
    markPaymentBeingHandled: (id, params) => {
      dispatch(Store.account.updatePaymentPipelines([id], 'beingHandledBy', params));
    },
  });
};

class components_modals_paymentsend_components_achview extends Component {




  render() {
    const paymentStatus = this.props.paymentStatuses.data.items[this.props.id];
    const createdStep = paymentStatus.created;
    const accountVendor = paymentStatus.verified.vendor;
    const disableButtons = this.props.paymentStatuses.status.updating;

    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Send Payment</h5>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col" >
                <p className="mb-3">
                  Please send
                  <span className="fw-bold pe-1 ps-1">{numeral(createdStep.amount).format('$0,0.00')}</span>
                  to
                  <span className="fw-bold pe-1 ps-1">{accountVendor.name}</span>.
                </p>
              </div>
            </div>
            {(() => {
              return (
                <div className={'row'}>
                  <div className={'col-12'}>
                    <div className="alert alert-warning" role="alert">
                      This account is not currently enrolled in automated ACH payments. To enroll please click {<a href={'http://localhost:5005/account/?tab=payment'}>here</a>}.
                      If you prefer to send check payments yourself you can manually mark this payment as sent.
                      If you have any questions or concerns, please email support at {this.props.providerTheme.supportEmail} or call {this.props.providerTheme.supportPhone}.
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={() => { if (disableButtons) return; this.props.close(); }}
              disabled={disableButtons}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-danger"
              data-dismiss="modal"
              onClick={() => { if (disableButtons) return; this.props.markPaymentAsSent(this.props.id); }}
              disabled={disableButtons}
            >
              Mark As Sent
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_paymentsend_components_achview);


