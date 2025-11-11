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
    paymentCards: state.account.paymentCards.data.items,
    paymentCardsStatus: state.account.paymentCards.status,
    vCards: _try(() => state.account.cardsIntegration.data.resources.vCards),
    cardsActivity: _try(() => Selectors.cardsActivity(state), {}),
    paymentCardsVCardMetadata: _try(() => Selectors.paymentCards(state).paymentCardsVCardMetadata, {}),
    users: state.users.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openCancelModal: (data) => {
      return dispatch(Store.router.openModal('Components.modals.areyousure', data));
    },
    openTransactionModal: (id, paymentCardId) => {
      return dispatch(Store.router.openModal('Components.modals.transactionhistory', { id, paymentCardId }));
    },
    cancelPaymentCard: (data) => {
      return dispatch(Store.account.updatePaymentCard(data, 'cancel'));
    },
  });
};

class components_overviews_paymentCardDetails extends Component {




  cancelPaymentCard = (id) => {
    this.props.openCancelModal({
      title: 'Cancel Card',
      content: 'You are about to cancel this purchase card. This action is irreversible, and will render the card unusable in the future.',
      noText: 'No',
      yesText: 'Yes',
      onYes: () => { this.props.cancelPaymentCard([{ id }]); },
    });
  }

  render() {
    const { paymentCards, vCards, cardsActivity, paymentCardsStatus, id, users, paymentCardsVCardMetadata } = this.props;

    const paymentCard = _try(() => paymentCards[id]);
    const transactionInformation = _try(() => cardsActivity.totalsByCard[paymentCard.vCard], {});
    const virtualCard = _try(() => vCards[paymentCard.vCard], {});
    const hasVirtualCard = Boolean(paymentCard.vCard);
    const canCancel = hasVirtualCard ? !_try(() => virtualCard._forPaymentId) && _try(() => virtualCard.status !== 'cancelled') && (paymentCard.status !== 'cancelled') : paymentCard.status !== 'cancelled';
    const cancelIsLoading = paymentCardsStatus.updating;
    const createdByProfile = _try(() => users[paymentCard._createdBy]);

    const hasTransactions = ((_try(() => transactionInformation.authorizationCount) || 0) + (_try(() => transactionInformation.clearedCount) || 0) + (_try(() => transactionInformation.declinedCount) || 0)) > 0;

    return (
      <div className="components_overviews_paymentCardDetails">
        <div className="row">
          <div className="col-12 col-md-auto" >
            <strong>Amount Remaining on Card</strong>
            <p className="text-muted mb-2">{numeral(paymentCardsVCardMetadata[id].remainingBalance).format('$0,0.00')}</p>
            <strong>Created At</strong>
            <p className="text-muted mb-2">{Utils.dates.dateToDay(paymentCard._createdAt, 'dayOnly')}</p>
            <strong>Created By</strong>
            {_try(() => createdByProfile) &&
              <div className="mb-2">
                <div>
                  <Components.avatar user={createdByProfile} />
                  <span className="text-muted ms-1">{_try(() => createdByProfile.firstName)} {_try(() => createdByProfile.lastName)}{!_try(() => createdByProfile.firstName) && !_try(() => createdByProfile.lastName) ? _try(() => createdByProfile.email) : ''}</span>
                </div>
              </div>
            }
            {!_try(() => createdByProfile) &&
              <p className="text-muted mb-2">Unknown</p>
            }
            <strong>Valid Through</strong>
            <p className="text-muted mb-2">{Utils.dates.dateToDay(paymentCardsVCardMetadata[id].validThrough, 'dayOnly')}</p>
          </div>
          <div className="col-12 col-md-auto" >
            <strong>Status</strong>
            <p className="text-muted mb-2">{`${_try(() => paymentCard.status.split('_').reduce((acc, cur, index) => { return `${acc}${index > 0 ? ' ' : ''}${cur.charAt(0).toUpperCase()}${cur.slice(1)}`; }, '')) || 'Unknown'}`}</p>
            <strong>Region</strong>
            <p className="text-muted mb-2">{_try(() => paymentCardsVCardMetadata[id].region, 'USA')}</p>
            <strong>Uses</strong>
            <p className="text-muted mb-2">{_try(() => paymentCardsVCardMetadata[id].uses, 0)}</p>
            <strong>Declines</strong>
            <p className="text-muted mb-2">{_try(() => paymentCardsVCardMetadata[id].declines, 0)}</p>
          </div>
        </div>
        <div>
          {((hasVirtualCard && hasTransactions) || canCancel) && <hr className="mt-1 mb-3" />}
          <div>
            {hasVirtualCard && hasTransactions &&
              <Components.button
                buttonText="View Transactions"
                className="btn btn-secondary left"
                onClick={() => { this.props.openTransactionModal(virtualCard.id, paymentCard.id); }}
                ariaLabel="View Transactions"
              />
            }
            {canCancel &&
              <Components.button
                buttonText="Cancel"
                className={`btn btn-danger left${hasTransactions ? ' ms-2' : ''}`}
                disabled={cancelIsLoading}
                onClick={() => { this.cancelPaymentCard(paymentCard.id); }}
                updating={cancelIsLoading}
              />
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_paymentCardDetails);


