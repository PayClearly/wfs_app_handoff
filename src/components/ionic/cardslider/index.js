import { connect, Component } from 'component';
import { createRef } from 'react';
import { IonSlides, IonSlide, IonSkeletonText } from '@ionic/react';

import avcard from 'assets/avcard.png';
import avcardp66 from 'assets/avcardp66.png';
import mastercard from 'assets/myworld.png';
import contractcard from 'assets/contractcard.png';
import contractblackcard from 'assets/uvairblackcard.png';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    cardsToDisplay: Selectors.cardsCarousel(state),
    cardsStatus: _resolve(state, 'wfs.cards.status'),
    cardsIntegrationStatus: _resolve(state, 'account.cardsIntegration.status'),
    memberRewards: state.wfs.memberRewards,
    context: state.wfs.data.context,
    wfsStatus: state.wfs.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openCardModal: (card, offsetTop) => {
      dispatch(Store.router.openModal('Components.ionic.modals.card', { card, animation: 'sharedElement', offsetTop }));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_cardslider extends Component {

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

  componentDidMount() {}
  componentWillUnmount() {}

  slider = createRef();

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
    const { cardsToDisplay, cardsStatus, cardsIntegrationStatus, context, wfsStatus } = this.props;
    const fetching = cardsStatus.initializing || cardsIntegrationStatus.fetching || wfsStatus.initializing;
    const fetched = cardsIntegrationStatus.fetched;

    const memberRewards = this.props.memberRewards || {};
    const pointSummary = (memberRewards.data[(memberRewards.collections.customerIds[this.props.context.customerNumber] || [])[0]] || {}).pointSummary;

    if (!fetching && fetched && context.tailNumber && cardsToDisplay.length === 0) {
      return (
        <div className="components_ionic_cardslider">
            <div className="no-cards-container">
              <div className="no-cards ion-text-center">No cards to display. If this is an error, please contact support.</div>
            </div>
        </div>
      );
    }

    if (!context.tailNumber && !wfsStatus.initializing && wfsStatus.initialized) {
      return (
        <div className="components_ionic_cardslider">
          <div className="no-cards-container">
            <div className="no-cards ion-text-center">Please select a tail.</div>
          </div>
        </div>
      );
    }

    if (fetched && !fetching && cardsStatus.initialized && context.tailNumber && cardsToDisplay.length > 0) {
      return (
        <div className="components_ionic_cardslider">
          <IonSlides
            key={`${context.tailNumber}`}
            ref={this.slider}
            pager
            onIonSlideTap={(e) => {
              // setting the selected card to be expanded must be done this way because of a (known by the ionic team) bug with ion slides
              this.slider.current.getSwiper().then((swiper) => {
                this.props.openCardModal(cardsToDisplay[swiper.clickedSlide.id], e.target.offsetTop + (pointSummary ? 122 : 76));
              });
            }}
            options={{
              speed: 400,
              spaceBetween: (350 - window.innerWidth) / 1.3,
              slidesPerView: 'auto',
            }}
          >
            {
              cardsToDisplay.length > 0 && cardsToDisplay.map((card, index) => (
                <IonSlide id={index} key={`${card.cardType}${index}`}>
                  <Components.ionic.virtualcard cardType={card.cardType} image={this.mapCardToStock(card.cardType, card.cardStock)} privateCardData={card} />
                </IonSlide>
              ))
            }
          </IonSlides>
        </div>
      );
    }

    return (
      <div className="components_ionic_cardslider">
        <div className="custom-skeleton">
          <IonSkeletonText animated style={{ width: '350px', height: '222px' }} />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_cardslider);

