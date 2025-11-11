import { connect, Component } from 'component';

import './index.scss';

const mapStateToProps = (state, props) => ({
  });

const mapDispatchToProps = (dispatch, props) => ({});

const mapResourcesToProps = (state, props) => ({});

class components_ionic_virtualcard extends Component {

  componentDidMount() {}
  componentWillUnmount() {}

  render() {

    const cardfactor = this.props.factor || 1;
    const privateCardData = this.props.privateCardData || {};
    const maskedNumber = privateCardData.cardNumber && _maskCardNumber(privateCardData.cardNumber);
    const shortNumber = maskedNumber && maskedNumber.length < 6;
    const [year, month] = privateCardData.expirationDate ? privateCardData.expirationDate.split('-') : ['0000', '00'];
    privateCardData.expires = `${month}/${year.slice(2, 4)}`;
    const textColor = 'var(--ion-color-dark-contrast)';
    const nameOnCard = privateCardData.cardHolderName || privateCardData.customerName;
    const { cardType } = privateCardData;

    return (
      <div
        style={{
          width: `${350 * cardfactor}px`,
          height: `${222 * cardfactor}px`,
          transitionDuration: '.5s',
        }}
        className={`components_ionic_virtualcard ${isDisplayed(this.props)}`}
      >
        {/* 325 x 203 */}

        <div style={{ position: 'relative', textAlign: 'left', color: textColor, height: 222 * cardfactor }} >
          <img src={this.props.image} alt="card" />

          <div
            style={{
              position: 'absolute',
              top: `${cardType === 'ALLIANCE' ? 136 * cardfactor : 118 * cardfactor}px`,
              left: `${25 * cardfactor}px`,
              width: `${300 * cardfactor}px`,
              height: `${26 * cardfactor}px`,
              fontSize: `${23 * cardfactor}px`,
              fontFamily: 'kredit',
              fontWeight: 600,
              color: cardType === 'BANK_CARD' ? 'grey' : '#fff',
            }}
          >
            {cardType === 'AVCARD' || cardType === 'BANK_CARD' ? maskedNumber : cardType === 'ALLIANCE' ? nameOnCard : ''}
          </div>
          <div
            style={{
              position: 'absolute',
              top: `${cardType === 'ALLIANCE' ? 166 * cardfactor : 156 * cardfactor}px`,
              left: `${25 * cardfactor}px`,
              width: `${300 * cardfactor}px`,
              height: `${26 * cardfactor}px`,
              fontSize: `${20 * cardfactor}px`,
              fontFamily: 'kredit',
              fontWeight: 600,
              color: cardType === 'BANK_CARD' ? 'grey' : '#fff',
            }}
          >
            {cardType === 'ALLIANCE' ? 'ACCT NBR' : nameOnCard}
          </div>
          <div
            style={{
              position: 'absolute',
              top: `${cardType === 'ALLIANCE' ? 166 * cardfactor : 156 * cardfactor}px`,
              left: `${130 * cardfactor}px`,
              width: `${300 * cardfactor}px`,
              height: `${26 * cardfactor}px`,
              fontSize: `${20 * cardfactor}px`,
              fontFamily: 'kredit',
              fontWeight: 600,
              color: cardType === 'BANK_CARD' ? 'grey' : '#fff',
            }}
          >
            {shortNumber ? maskedNumber : ''}
          </div>
          <div
            style={{
              position: 'absolute',
              top: `${196 * cardfactor}px`,
              left: `${25 * cardfactor}px`,
              width: `${60 * cardfactor}px`,
              height: `${26 * cardfactor}px`,
              fontSize: `${18 * cardfactor}px`,
              fontFamily: 'kredit',
              fontWeight: 600,
              color: cardType === 'BANK_CARD' ? 'grey' : '#fff',
            }}
          >
            {privateCardData.expires || ''}
          </div>
          <div
            style={{
              position: 'absolute',
              top: `${196 * cardfactor}px`,
              left: `${130 * cardfactor}px`,
              width: `${70 * cardfactor}px`,
              height: `${26 * cardfactor}px`,
              fontSize: `${18 * cardfactor}px`,
              fontFamily: 'kredit',
              fontWeight: 600,
              color: cardType === 'BANK_CARD' ? 'grey' : '#fff',
            }}
          >
            {cardType === 'AVCARD' || cardType === 'ALLIANCE' ? privateCardData.tailNumber.includes('ANY A/C') ? 'ANY A/C' : privateCardData.tailNumber : ''}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_virtualcard);

// Internal Helper Functions ...
function _maskCardNumber(cardNumber) {
  if (cardNumber.length < 6) return cardNumber;
  const arr = cardNumber.split('');
  arr.splice(12, 0, ' ');
  arr.splice(8, 0, ' ');
  arr.splice(4, 0, ' ');
  return arr.join('');
}

function isDisplayed(props) {
  if (props.collapsable && !props.cardExpanded) {
    return '';
  }
  if (props.cardExpanded === props.cardType) {
    return 'displayed-virtualcard';
  }
  return '';
}

