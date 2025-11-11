import { connect, Component } from 'component';
import { IonTitle, IonButton, IonButtons, IonHeader, IonToolbar, IonContent, IonSearchbar, createAnimation, IonItem, IonLabel, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/react';
import { star, starOutline, chevronBack } from 'ionicons/icons';
import { Virtuoso } from 'react-virtuoso/dist/index.mjs';
import jwtDecode from 'jwt-decode';
import firebase from 'firebase';

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    customers: state.wfs.customers,
    favoriteContext: state.wfs.preferences.data.favoriteContext,
    context: state.wfs.data.context,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
    setFavoriteContext: (context) => {
      dispatch(Store.wfs.setFavoriteContext(context));
    },
    setContext: (context) => {
      dispatch(Store.wfs.setContext(context));
    },
    syncCustomers: (eventDetail, closeValue, closeModal) => {
      return dispatch(Store.wfs.syncCustomers(eventDetail, closeValue, closeModal));
    },
    refreshUser: (callback) => {
      return dispatch(Store.wfs.refreshToken(callback));
    },
    setAccess: (data) => {
      return dispatch(Store.user.setAccess(data));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_modals_tailSelect extends Component {

  state = {
    searchText: '',
  };

  componentDidMount() { }

  componentWillReceiveProps(nextProps) { }

  componentWillUnmount() { }

  setContext = (customerNumber, tailNumber) => {
    this.props.setContext({ customerNumber, tailNumber });
    this.props.closeModal();
    this.props.closeModal();
  };

  toggleFavorite = (e, customerNumber, tailNumber) => {
    e.stopPropagation();
    createAnimation()
      .addElement(e.target)
      .duration(200)
      .keyframes([
        { offset: 0.5, transform: 'scale(1.5)' },
      ])
      .play();
    const context = { customerNumber, tailNumber };
    this.props.setFavoriteContext(Utils.wfsContextMatch(this.props.favoriteContext, context) ? {} : context);
  };

  handleRefresh = (event) => {
    this.props.refreshUser((jwt) => {
      const jwtDecoded = jwtDecode(jwt);
      this.props.setAccess({ jwt: jwtDecoded });
      this.props.syncCustomers(event && event.detail || false, this.props.data.customerNumber, this.props.closeModal);
    });
  };

  render() {
    const { searchText } = this.state;
    const flightDept = this.props.data.flightDept;
    const customerNumber = this.props.data.customerNumber;
    const filteredTailNumbers = this.props.customers.collections.tailNumbers[customerNumber].filter(tailNumber => tailNumber.toLowerCase().includes(searchText.toLowerCase()));

    return (
      <div className="components_ionic_modals_tailSelect ion-float-end" style={{ height: '100%' }}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{flightDept}</IonTitle>
            <IonButtons slot="start">
              <IonButton onClick={this.props.closeModal}>
                <IonIcon icon={chevronBack} />
                Back
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="tail-select-content" fullscreen style={{ height: '100%' }}>
          <IonRefresher slot="fixed" onIonRefresh={this.handleRefresh} style={{ 'zIndex': 999 }}>
            <IonRefresherContent />
          </IonRefresher>
          <IonSearchbar
            value={this.state.searchText}
            onIonChange={e => this.setState({ searchText: e.detail.value })}
            inputMode="text"
          />
          <Virtuoso
            style={{ height: '100%' }}
            data={filteredTailNumbers.length ? filteredTailNumbers : ['No Match']}
            fixedItemHeight={56}
            itemContent={(index, tailNumber) => {
              if (tailNumber === 'No Match') {
                return (
                  <div style={{ height: '56px' }}>
                    <IonItem disabled>No Matches Found.</IonItem>
                  </div>
                );
              }
              if (!tailNumber) return null;
              const isFavorite = Utils.wfsContextMatch({ customerNumber, tailNumber }, this.props.favoriteContext);
              return (
                <div style={{ height: '56px' }}>
                  <IonItem
                    button
                    detail={false}
                    onClick={() => this.setContext(customerNumber, tailNumber)}
                  >
                    <IonLabel>{tailNumber}</IonLabel>
                    <IonIcon onClick={e => this.toggleFavorite(e, customerNumber, tailNumber)} size="large" color={isFavorite ? 'primary' : 'medium'} icon={isFavorite ? star : starOutline} />
                  </IonItem>
                </div>
              );
            }}
          />
        </IonContent>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_tailSelect);


