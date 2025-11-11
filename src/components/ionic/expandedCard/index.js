import { connect, Component } from 'component';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import avcard from 'assets/avcard.png';
import mastercard from 'assets/myworld.png';
import contractcard from 'assets/contractcard.png';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    validCards: ['myWorld', 'avCard', 'worldFuelContract'],
    cardExpanded: state.router.cardExpanded,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateSelectedCard: (data) => {
      return dispatch(Store.router.toggleCardEnlarged(data));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_expandedCard extends Component {




  unSetCard = () => {
    this.props.updateSelectedCard(null);
  };

  render() {
    const cardsMap = {
      myWorld: mastercard,
      avCard: avcard,
      worldFuelContract: contractcard,
    };
    return (
      <div
        className="components_ionic_expandedCard"
        style={{
          opacity: this.props.cardExpanded ? '1' : '0',
          height: this.props.cardExpanded ? '100vh' : '0vh',
          zIndex: this.props.cardExpanded ? 2000 : -500,
          width: 'auto',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            zIndex: '1',
            backgroundColor: 'rgba(0,0,0,.7)',
            height: this.props.cardExpanded ? '100vh' : '0vh',
            width: '100vw',
          }}
          onTouchEnd={this.unSetCard}
          role="tooltip"
        >
          <Components.ionic.virtualcard collapsable style={{ zIndex: '2' }} cardType={this.props.cardExpanded} image={cardsMap[this.props.cardExpanded]} />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_expandedCard);


