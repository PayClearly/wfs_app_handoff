import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonGrid, IonRow, IonCol, IonSkeletonText } from '@ionic/react';


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_userCard extends Component {

  state = {
    showActionSheet: false,
  };




  render() {
    const { cardData } = this.props;
    const hasCycle = (cardData.cycleIndicator[0] !== 'N');

    return (
      <div className="components_ionic_userCard">
        <IonGrid className="ion-padding">
          <IonRow className="card-detail-row">
            <IonCol>
              <IonRow>
                <IonCol size="6" className="card-descriptors">
                  Card Last 4:
                </IonCol>
                <IonCol size="6" className="card-descriptors">
                  Card Status:
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6" className="card-values">
                  {`*${cardData.cardLast4}`}
                </IonCol>
                <IonCol size="6" className="card-values colored-value">
                  {`${_formatStatus(cardData.status)}`}
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow>
          <IonRow className="card-detail-row">
            <IonCol>
              <IonRow>
                <IonCol size="6" className="card-descriptors">
                  Cardholder Name:
                </IonCol>
                <IonCol size="6" className="card-descriptors">
                  Card Expiration:
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6" className="card-values">
                  {`${cardData.cardHolderName}`}
                </IonCol>
                <IonCol size="6" className="card-values">
                  {`${_formatExpireDate(cardData.expireDate)}`}
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <h6>CARDHOLDER LIMITS</h6>
            </IonCol>
          </IonRow>
          <IonRow className="card-limit-row">
            <IonCol>
              <IonRow>
                <IonCol size="6" className="card-descriptors">
                  {hasCycle ? 'Cycle Spend Avail:' : 'Daily Spend Avail:'}
                </IonCol>
                <IonCol size="6" className="card-descriptors">
                  Max Trans. Limit:
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6" className="card-values">
                  {hasCycle ? _parseSpendAvailable(parseInt(_resolve(cardData, 'cycleTransactionAmountLimit', 0), 10), parseInt(_resolve(cardData, 'cycleTransactionAmountUsed', 0), 10)) : _parseSpendAvailable(parseInt(_resolve(cardData, 'dailyTransactionAmountLimit', 0), 10), parseInt(_resolve(cardData, 'dailyTransactionAmountUsed', 0), 10))}
                </IonCol>
                <IonCol size="6" className="card-values">
                  {cardData.transactionAmountLimit ? `$${cardData.transactionAmountLimit}` : 'N/A'}
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow>
          <IonRow className="card-limit-row">
            <IonCol>
              <IonRow>
                <IonCol size="6" className="card-descriptors">
                  Cycle Spend Limit:
                </IonCol>
                <IonCol size="6" className="card-descriptors">
                  Daily Spend Limit:
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6" className="card-values">
                  {hasCycle ? `$${cardData.cycleTransactionAmountLimit}` : 'N/A'}
                </IonCol>
                <IonCol size="6" className="card-values">
                  {cardData.dailyTransactionAmountLimit ? `$${cardData.dailyTransactionAmountLimit}` : 'N/A'}
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow>
          <IonRow className="card-limit-row">
            <IonCol>
              <IonRow>
                <IonCol size="6" className="card-descriptors">
                  Transactions (Cycle):
                </IonCol>
                <IonCol size="6" className="card-descriptors">
                  Transactions (Daily):
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6" className="card-values">
                  {hasCycle && cardData.cycleTransactionCountUsed && cardData.cycleTransactionCountLimit ? `${cardData.cycleTransactionCountUsed} / ${cardData.cycleTransactionCountLimit}` : 'N/A'}
                </IonCol>
                <IonCol size="6" className="card-values">
                  {cardData.dailyTransactionCountUsed && cardData.dailyTransactionCountLimit ? `${cardData.dailyTransactionCountUsed} / ${cardData.dailyTransactionCountLimit}` : 'N/A'}
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow>
          <IonRow className="card-limit-row">
            <IonCol>
              <IonRow>
                <IonCol size="6" className="card-descriptors">
                  Refresh Cycle:
                </IonCol>
                <IonCol size="6" className="card-descriptors">
                  Refresh Day:
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6" className="card-values">
                  {hasCycle && cardData.cycleIndicator ? `${cardData.cycleIndicator}` : 'N/A'}
                </IonCol>
                <IonCol size="6" className="card-values">
                  {hasCycle && cardData.cycleRefreshDay ? `${_formatLessThanTen(cardData.cycleRefreshDay)}` : 'N/A'}
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow>
        </IonGrid>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_userCard);

// Internal Helper Functions ...
function _formatLessThanTen(time) {
  if (time.length > 2) return time;
  return time < 10 ? `0${time}` : time;
}

const _formatStatus = (status) => {
  return `${status.split('_').reduce((acc, cur, index) => `${acc}${index > 0 ? ' ' : ''}${cur.charAt(0).toUpperCase()}${cur.slice(1)}`, '')}`;
};

const _formatExpireDate = (expireDate) => {
  if (!expireDate || expireDate === '0') return 'Processing...';
  return `${expireDate.slice(4, 6)}-${expireDate.slice(0, 4)}`;
};

const _parseSpendAvailable = (limit, used) => {
  if (limit === 0) return 'N/A';
  return `$${limit - used}`;
};

