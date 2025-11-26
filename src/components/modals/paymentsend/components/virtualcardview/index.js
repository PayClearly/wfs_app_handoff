import {
  connect, Component,
} from 'component';
// Third Party Imports ...
import numeral from 'numeral';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state) => ({
  paymentStatuses: state.account.paymentStatuses,
  privateVirtualCard: state.account.privateVirtualCard,
  users: state.users.data.items,
  accounts: state.accounts,
  accountVendors: Selectors.accountVendors(state).all,
  vCards: _try(() => state.account.cardsIntegration.data.resources.vCards),
});

const mapDispatchToProps = (dispatch) => ({
  setPrivateCards: (ids) => {
    dispatch(Store.account.fetchPrivateVirtualCards(ids));
  },
  clearPrivateCard: () => {
    dispatch(Store.account.clearPrivateVirtualCard());
  },
  markPaymentAsSent: (id, params) => {
    dispatch(Store.account.updatePaymentPipelines([id], 'markAsSent', params));
  },
});

const mapResourcesToProps = () => { };

class components_modals_paymentsend_components_virtualcardview extends Component {
  state = {
    hasCopied: false,
  };

  componentDidMount() {
    const paymentStatus = this.props.paymentStatuses.data.items[this.props.id];
    const fundedStep = paymentStatus.funded;
    const vCardIds = fundedStep.vCards ? fundedStep.vCards.map((card) => card.id) : [];

    if (vCardIds.length) {
      this.props.setPrivateCards(vCardIds);
    }
  }

  componentWillUnmount() {
    this.props.clearPrivateCard();
  }

  render() {
    const paymentStatus = this.props.paymentStatuses.data.items[this.props.id];
    const createdStep = paymentStatus.created;
    const vendorId = _try(() => this.props.paymentStatuses.data.items[this.props.id].created.vendorId);
    const accountVendor = this.props.accountVendors[vendorId];
    const disableButtons = this.props.paymentStatuses.status.updating;
    const vendorFee = createdStep.fee || null;

    const cards = paymentStatus.funded.vCards;
    const privateCards = this.props.privateVirtualCard.data.items;
    const logo = _try(() => this.props.accounts.data.items[this.props.accountId].virtualCardLogo);
    const loading = this.props.privateVirtualCard.status.fetching;
    const createdBy = this.props.users[paymentStatus._createdBy];
    const notSetTag = (<i>Not set</i>);

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
            <div className="alert alert-primary mb-3">
              <p className="mb-0">
                Please send
                <span className="fw-bold pe-1 ps-1">{numeral(createdStep.amount).format('$0,0.00')}</span>
                to
                <span className="fw-bold pe-1 ps-1">{accountVendor.name}</span>
              </p>
            </div>
            <h3 className="mt-4">Contact Details</h3>
            <div className="row">
              <div className="col-12 col-md-6">
                <strong>Contact Name</strong>
                <br />
                <p className="text-muted">
                  {accountVendor.contactName || notSetTag}
                </p>
              </div>
              <div className="col-12 col-md-6">
                <strong>Contact Email</strong>
                <br />
                <p className="text-muted">
                  {accountVendor.contactEmail || notSetTag}
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col-12 col-md-6">
                <strong>Contact Phone Number</strong>
                <br />
                <p className="text-muted">
                  {accountVendor.contactPhoneNumber || notSetTag}
                </p>
              </div>
              <div className="col-12 col-md-6">
                <strong>Contact Fax Number</strong>
                <br />
                <p className="text-muted">
                  {accountVendor.contactFaxNumber || notSetTag}
                </p>
              </div>
            </div>
            {accountVendor.notes
              && <div>
                <h5>Vendor Payment Notes</h5>
                <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                  {accountVendor.notes}
                </p>
              </div>}
            {cards.map((card, index) => {
              const { cardType } = this.props.vCards[card.id];
              return (
                <div className="col-12">
                  <div className={'card h-100'}>
                    <div className={'card-header default-bg'}>
                      Virtual Card {index + 1} of {cards.length} - for {numeral(card.amount).format('$0.00')}
                    </div>
                    <div className={'card-body flex-center-column'}>
                      {vendorFee
                        && <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <span>Net Payment:&nbsp;&nbsp;</span>
                            </div>
                            <div>
                              <strong>{numeral(card.amount).subtract(vendorFee / cards.length).format('$0.00')}</strong>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <span>Service Fee:&nbsp;&nbsp;</span>
                            </div>
                            <div>
                              <strong>{numeral(vendorFee / cards.length).format('$0.00')}</strong>
                            </div>
                          </div>
                          <hr className="my-1" />
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <span>Total Payment:&nbsp;&nbsp;</span>
                            </div>
                            <div>
                              <strong>{numeral(card.amount).format('$0.00')}</strong>
                            </div>
                          </div>
                        </div>}
                      <Components.virtualcard
                        cardType={cardType}
                        loading={loading}
                        privateCardData={privateCards[card.id]}
                        createdBy={createdBy}
                        logo={logo}
                        showCopierTooltip
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={() => { if (disableButtons) { return; } this.props.close(); }}
              disabled={disableButtons}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-danger"
              data-dismiss="modal"
              onClick={() => { if (disableButtons) { return; } this.props.markPaymentAsSent(this.props.id); }}
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

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_paymentsend_components_virtualcardview);

