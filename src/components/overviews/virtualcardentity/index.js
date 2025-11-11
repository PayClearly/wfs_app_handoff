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
    vCards: _try(() => state.account.cardsIntegration.data.resources.vCards),
    vCardsDenorm: _try(() => Selectors.cardsActivity(state), {}),
    cardsStatus: _try(() => state.account.cardsIntegration.status),
    users: state.users.data.items,
    accounts: state.accounts.data.items,
    accountId: state.account.data.id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openTransactionHistoryModal: (id) => {
      return dispatch(Store.router.openModal('Components.modals.transactionhistory', { id }));
    },
    openVirtualCardModal: (id) => { dispatch(Store.router.openModal('Components.modals.virtualcard', { id })); },
    openCancelModal: (data) => {
      dispatch(Store.router.openModal('Components.modals.areyousure', data));
    },
  });
};

class components_overviews_virtualcardentity extends Component {




  cancelCard = (id) => {
    if (this.props.forPayment) return;
    const cardChanges = { id, status: 'cancelled' };

    this.props.openCancelModal({
      title: 'Cancel Card',
      content: 'You are about to cancel this credit card. This action is permanent, and will render the card unusable in the future.',
      noText: 'No',
      yesText: 'Yes',
      onYes: () => { this.props.updateVirtualCard(cardChanges); },
    });
  }

  render() {
    const { vCards, vCardsDenorm, cardsStatus } = this.props;
    const virtualCard = Object.assign({}, vCards[this.props.cardId] || {}, _try(() => vCardsDenorm.totalsByCard[this.props.cardId], {}) || {}, { logo: this.props.accounts[this.props.accountId].virtualCardLogo || null });
    return (
      <div className="card components_overviews_virtualcardentity" style={{ border: 'none' }}>
        <div className="card-body">
          <div className="row">
            <div className="col-md mb-3 virtualCardContainer" >
              <div className="virtualCard">
                <Components.virtualcard
                  blur
                  factor={1.2}
                  onClick={() => {
                    this.props.openVirtualCardModal(virtualCard.id);
                  }}
                  logo={virtualCard.logo}
                  createdBy={this.props.users[virtualCard._createdBy]}
                  cardType={virtualCard.cardType}
                />
              </div>
              <div className="virtualCardLink"><a>click to view</a></div>
            </div>
            <div className="col-md" >
              <div className="row ps-2">
                <div className="col" >
                  <strong>Amount</strong>
                  <p className="text-muted mb-2">{(virtualCard.amount && numeral(virtualCard.amount).format('$0,0.00')) || ''}</p>
                  <strong>Created At</strong>
                  <p className="text-muted mb-2">{_try(() => Utils.dates.dateToDay(virtualCard.createdAt, 'dayOnly')) || 'Unknown'}</p>
                  <strong>Valid Through</strong>
                  <p className="text-muted mb-2">{_try(() => Utils.dates.dateToDay(virtualCard.validThrough, 'dayOnly')) || 'Unknown'}</p>
                  <strong>Status</strong>
                  <p className="text-muted mb-2">{virtualCard.status || 'Unknown'}</p>
                  <strong>MCC</strong>
                  <p className="text-muted mb-2">{virtualCard.mccs || 'None'}</p>
                </div>
                <div className="col" >
                  <strong>Remaining</strong>
                  <p className="text-muted mb-2">{(virtualCard.remaining && numeral(virtualCard.remaining).format('$0,0.00')) || '$0.00'}</p>
                  <strong>Uses</strong>
                  <p className="text-muted mb-2">{virtualCard.timesUsed || 0} of {virtualCard.maxUses || 0}</p>
                  <strong>Region</strong>
                  <p className="text-muted mb-2">{virtualCard.region || 'Unknown'}</p>
                  <strong>Exact Match</strong>
                  <p className="text-muted mb-2">{(virtualCard.exactMatch && 'True') || 'False'}</p>
                  <strong>TCC</strong>
                  <p className="text-muted mb-2">{virtualCard.tccs || 'None'}</p>
                </div>
              </div>
              {((virtualCard.authorizationCount || 0) + (virtualCard.clearedCount || 0) + (virtualCard.declinedCount || 0)) > 0 &&
                <div className="row ps-2">
                  <div className="col-12 text-start">
                    <div>
                      <button className="btn btn-secondary left" type="button" onClick={() => { this.props.openTransactionHistoryModal(virtualCard.id); }}>
                        View Card Transactions
                      </button>
                    </div>
                  </div>
                </div>
              }
              {!virtualCard._forPaymentId && virtualCard.status !== 'cancelled' && !this.props.forPayment &&
                <div className="w-100 text-center pb-4 pt-1">
                  <button className="btn btn-danger center" disabled={cardsStatus.updating} onClick={() => { this.cancelCard(virtualCard.id); }}>
                    Cancel Card{cardsStatus.updating && <span>&nbsp;<Components.spinner height={'20px'} /></span>}
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_virtualcardentity);


