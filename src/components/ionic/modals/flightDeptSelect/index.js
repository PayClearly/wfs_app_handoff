import { connect, Component } from 'component';
import {
  IonTitle,
  IonButton,
  IonButtons,
  IonHeader,
  IonToolbar,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonListHeader,
  createAnimation,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { star, starOutline, close } from 'ionicons/icons';
import jwtDecode from 'jwt-decode';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';

import './index.scss';

const mapStateToProps = (state) => ({
  tailNumbers: Selectors.tailsByFlightDept(state),
  flightDeptToCustomerNumberMap: state.wfs.customers.collections.customerNames,
  previousContexts: state.wfs.preferences.data.previousContexts,
  customers: state.wfs.customers.data,
  favoriteContext: state.wfs.preferences.data.favoriteContext,
});

const mapDispatchToProps = (dispatch) => ({
  closeModal: () => {
    dispatch(Store.router.closeModal());
  },
  openModal: (customerNumber, flightDept) => {
    dispatch(Store.router.openModal('Components.ionic.modals.tailSelect', {
      customerNumber, flightDept, animation: 'slideLeft', offsetTop: 0,
    }));
  },
  setFavoriteContext: (context) => {
    dispatch(Store.wfs.setFavoriteContext(context));
  },
  setContext: (context) => {
    dispatch(Store.wfs.setContext(context));
  },
  syncCustomers: (eventDetail) => dispatch(Store.wfs.syncCustomers(eventDetail)),
  refreshUser: (callback) => dispatch(Store.wfs.refreshToken(callback)),
  setAccess: (data) => dispatch(Store.user.setAccess(data)),
});

// eslint-disable-next-line camelcase
class components_ionic_modals_flightDeptSelect extends Component {

  state = {
    tailNumber: undefined,
    flightDept: undefined,
    favorite: '',
    typeahead: '',
    searchText: '',
  };

  setContext = (customerNumber, tailNumber) => {
    this.props.setContext({ customerNumber, tailNumber });
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
      this.props.syncCustomers((event && event.detail) || false);
    });
  };

  render() {
    const { searchText } = this.state;
    const { previousContexts, customers, favoriteContext } = this.props;
    const filteredFlightDepts = Object.keys(this.props.tailNumbers)
      .filter((flightDept) => flightDept.toLowerCase().includes(searchText.toLowerCase()));
    const tailNumberItem = ({ customerNumber, tailNumber }) => {
      const isFavorite = Utils.wfsContextMatch(favoriteContext, { customerNumber, tailNumber });
      return (
        <IonItem
          key={`${customerNumber}-${tailNumber}`}
          button
          detail={false}
          onClick={() => this.setContext(customerNumber, tailNumber)}
        >
          <IonLabel>{`${_try(() => customers[customerNumber].customerName)} - ${tailNumber}`}</IonLabel>
          <IonIcon
            onClick={(e) => this.toggleFavorite(e, customerNumber, tailNumber)}
            size="large"
            color={isFavorite ? 'primary' : 'medium'}
            icon={isFavorite ? star : starOutline}
          />
        </IonItem>
      );
    };

    const flightDeptItem = (flightDept) => {
      const customerNumber = this.props.flightDeptToCustomerNumberMap[flightDept];
      return (
        <IonItem
          key={`${customerNumber}`}
          button
          detail
          onClick={() => this.props.openModal(customerNumber, flightDept)}
        >
          <IonLabel>{flightDept}</IonLabel>
        </IonItem>
      );
    };

    return (
      <div className="components_ionic_modals_flightDeptSelect ion-float-end">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Flight Departments</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={this.props.closeModal}>
                <IonIcon size="large" icon={close} color="light" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="flight-dept-content" fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={this.handleRefresh} style={{ zIndex: 999 }}>
            <IonRefresherContent />
          </IonRefresher>
          <IonSearchbar
            value={this.state.searchText}
            onIonChange={(e) => this.setState({ searchText: e.detail.value })}
            inputMode="text"
          />
          <IonList lines="full">
            {
              filteredFlightDepts.length > 0
              && filteredFlightDepts.map((flightDept) => flightDeptItem(flightDept))
            }
            {
              filteredFlightDepts.length === 0 && searchText
              && <IonItem disabled>No Matches Found.</IonItem>
            }
            {
              previousContexts.length > 0 && <IonListHeader className="list-header">Recent Tail Numbers</IonListHeader>
            }
            {
              previousContexts.map((context) => tailNumberItem(context))
            }
          </IonList>
        </IonContent>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_ionic_modals_flightDeptSelect);
