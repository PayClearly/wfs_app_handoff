import { connect, Component } from 'component';
import { IonHeader, IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    pCards: _resolve(state, 'account.cardsIntegration.data.resources.pCards', {}),
    userId: _resolve(state, 'user.access.data.uid', ''),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};
const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_routes_account extends Component {

  state = {
    show: 'profile',
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onSegmentChange = (e) => {
    this.setState({ show: e.detail.value });
  }

  render() {
    const { pCards, userId } = this.props;
    const pCard = Object.entries(pCards).filter(card => card[1].assignedTo === userId);
    const cardData = pCard && pCard[0] && pCard[0][1] ? pCard[0][1] : null;

    return (
      <div className="components_ionic_routes_account">
        <IonHeader>
          <IonSegment value={this.state.show} onIonChange={this.onSegmentChange}>
            <IonSegmentButton value="profile">
              <IonLabel>Profile</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="mycard" disabled={!cardData}>
              <IonLabel>My Card</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonHeader>
        <SwitchTransition mode="out-in">
          <CSSTransition
            classNames="ionic-account-route-transitioner"
            timeout={100}
            key={this.state.show}
          >
            <div>
              { this.state.show === 'profile' &&
                <Components.ionic.profile />
              }
              { this.state.show === 'mycard' &&
                <Components.ionic.userCard cardData={cardData} />
              }
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_routes_account);
