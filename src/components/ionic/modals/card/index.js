import { connect, Component, bindActionCreators, Fragment } from 'component';
import { CreateAnimation, IonIcon } from '@ionic/react';
import { close } from 'ionicons/icons'
import { createRef } from 'react';

import avcard from 'assets/avcard.png';
import avcardp66 from 'assets/avcardp66.png';
import mastercard from 'assets/myworld.png';
import contractcard from 'assets/contractcard.png';
import contractblackcard from 'assets/uvairblackcard.png';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

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

class components_ionic_modals_card extends Component {

  state = {
    cardsMap: {
      BANK_CARD: mastercard,
      AVCARD_BLUE_CARDS: avcard,
      DEFAULT_AVCARD: avcard,
      WORLD_FUEL_CONTRACT: contractcard,
      DEFAULT_FUEL_CONTRACT: contractcard,
      CONOCO_PHILIPS: avcardp66,
      CONOCO_PHILIPS_2: avcardp66,
      WORLD_FUEL_UV_CONTRACT: contractblackcard,
    },
  };

  componentDidMount() { }
  componentDidUpdate(prevProps) {
    if (!prevProps.dismissing && this.props.dismissing) {
      this.animation.current.animation.play();
    }
  }
  componentWillUnmount() { }

  animation = createRef(null);

  mapCardToStock = (cardType, cardStock) => {
    let displayCardStock = this.state.cardsMap[cardStock] || false;
    if (!displayCardStock) {
      switch (cardType) {
        case 'BANK_CARD':
          displayCardStock = this.state.cardsMap.BANK_CARD;
          break;
        case 'ALLIANCE':
          displayCardStock = this.state.cardsMap.DEFAULT_FUEL_CONTRACT;
          break;
        case 'AVCARD':
        default:
          displayCardStock = this.state.cardsMap.DEFAULT_AVCARD;
          break;
      }
    }
    return displayCardStock;
  };

  render() {
    const { card, offsetTop } = this.props.data;
    const scalingFactor = 1;
    // still doesnt work well for smaller sizes
    const translateY = ((offsetTop + window.innerHeight - (scalingFactor * 350)) / 2);
    return (
      <div className="components_ionic_modals_card">
        <IonIcon size="large" icon={close} className="close-button" role="button" color="light" onClick={() => this.props.modal.current.dismiss()} />
        <CreateAnimation
          ref={this.animation}
          duration={300}
          easing="ease-out"
          fromTo={[{ property: 'transform', fromValue: `rotate(0deg) scale(1) translate(0%, ${offsetTop}px)`, toValue: `rotate(90deg) scale(${scalingFactor}) translate(${translateY}px, 0px)` }]}
          direction={this.props.dismissing ? 'reverse' : 'normal'}
          play
        >
          <div>
            <Components.ionic.virtualcard ref={card} cardType={card.cardType} image={this.mapCardToStock(card.cardType, card.cardStock)} privateCardData={card} />
          </div>
        </CreateAnimation>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_card);


