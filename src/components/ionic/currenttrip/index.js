import { connect, Component } from 'component';
import {
  IonCard,
  IonCardHeader,
  IonText,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import {
  airplane,
  build,
  restaurant,
  colorFill,
  bed,
  car,
} from 'ionicons/icons';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  context: state.wfs.data.context,
  currentTrip: Selectors.currenttrip(state),
  tripsStatus: state.wfs.trips.status,
  wfsStatus: state.wfs.status,
});

const mapDispatchToProps = (dispatch) => ({
  navigate: (name, params = {}) => {
    dispatch(Store.router.navigateTo(name, params));
  },
  syncCurrentTrip: () => {
    dispatch(Store.wfs.syncTrips());
  },
  syncTrips: () => {
    dispatch(Store.wfs.syncTrips());
  },
});

const wfsUnlinkedMessage = 'com.wfs.graphql.common.exception.DetailedGraphQLException: Tail number not available from external source. Setup may be incomplete.';
const wfsTimedOutMessage = '504: Gateway Time-out';

class componentsIonicCurrenttrip extends Component {
  state = {
    typeIconMap: {
      fuel: colorFill,
      catering: restaurant,
      fbo: build,
      hotel: bed,
      transportation: car,
    },
  };

  componentDidMount() {
    if (this.props.context.tailNumber) {
      this.props.syncCurrentTrip();
    }
  }

  componentWillUnmount() {}

  render() {
    const leg = _resolve(this.props, 'currentTrip.leg');
    const { initialized, initializingError } = this.props.tripsStatus;
    const context = this.props.context.tailNumber;

    if (initializingError) {
      let actionButton = false;
      let errorMessage = 'Something unexpected happened, unable to fetch trips.';
      let actionMessage;
      let action;
      switch (initializingError) {
        case wfsUnlinkedMessage:
          errorMessage = 'Trips are not linked for this tail.';
          break;
        case wfsTimedOutMessage:
          errorMessage = 'Your request timed out';
          actionButton = true;
          actionMessage = 'Press here to retry';
          action = this.props.syncTrips;
          break;
        default:
          break;
      }
      return (
        <IonCard className="components_ionic_currenttrip">
          <IonCardHeader>
            <IonCardTitle>
              <div>Current Trip</div>
              <IonText color="primary">
                Unavailable
              </IonText>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="ion-no-padding">
            <div>
              <p className="small-text ion-text-center">
                {errorMessage}
              </p>
            </div>
            {
            actionButton && (
              <IonButton
                expand="block"
                fill="outline"
                className="ion-padding ion-text-uppercase"
                onClick={action}
              >
                {actionMessage}
              </IonButton>
            )
          }
          </IonCardContent>
        </IonCard>
      );
    }

    if (!context && this.props.wfsStatus.initialized) {
      return (
        <IonCard className="components_ionic_currenttrip">
          <IonCardHeader>
            <IonCardTitle>
              <div>Current Trip</div>
              <IonText color="primary">
                Unavailable
              </IonText>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="ion-no-padding">
            <div>
              <p className="small-text ion-text-center">Please select a tail to see trip details</p>
            </div>
          </IonCardContent>
        </IonCard>
      );
    }
    if (!initialized) {
      return (<Components.ionic.skeletonCard />);
    }
    return (
      <IonCard className="components_ionic_currenttrip">
        <IonCardHeader>
          <IonCardTitle>
            <div>Current Trip</div>
            <IonText color="primary">
              {_resolve(leg, 'fromFlightLeg.icao', '-----')}
              <IonIcon className="plane-icon" size="small" icon={airplane} />
              {_resolve(leg, 'toFlightLeg.icao', '-----')}
            </IonText>
          </IonCardTitle>
        </IonCardHeader>

        <IonCardContent className="ion-no-padding">
          {
            leg
            && (
              <>
                <IonGrid className="ion-padding">
                  <IonRow>
                    <IonCol>FBO</IonCol>
                    <IonCol className="ion-text-right">{leg.toFlightLeg.icao}</IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol>Tail Number</IonCol>
                    <IonCol className="ion-text-right">{leg.tailNumber}</IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol>Scheduled Arrival</IonCol>
                    <IonCol className="ion-text-right">
                      {Utils.dates.dateToDay(new Date(leg.arriveAirportLocal), 'dayAndMilitaryTime')}
                    </IonCol>
                  </IonRow>
                </IonGrid>
                {
                  leg.arrivalLogisticsServices
                  && !!leg.arrivalLogisticsServices.length
                  && leg.arrivalLogisticsServices.some((val) => val.providerName)
                  && (
                    <IonList className="ion-padding" lines="none">
                      <IonLabel>SERVICES REQUESTED</IonLabel>
                      {
                        leg.arrivalLogisticsServices.map(({ comments, providerName, type }) => {
                          if (!providerName) { return null; }
                          return (
                            <IonItem style={{ display: 'flex' }} className="ion-padding-top ion-justify-content-start">
                              <IonIcon className="service-icon" icon={this.state.typeIconMap[type.toLowerCase()]} />
                              <div>
                                <div className="ion-text-capitalize">{type}</div>
                                <div>{providerName}</div>
                                { comments && <div>{comments}</div> }
                              </div>
                            </IonItem>
                          );
                        })
                      }
                    </IonList>
                  )
                }
                <IonButton
                  className="ion-padding"
                  expand="block"
                  fill="outline"
                  onClick={() => this.props.navigate('trips')}
                >
                  SHOW MORE
                </IonButton>
              </>
            )
          }
          {
            !leg
            && (
              <div>
                {
                  this.props.tripsStatus.initialized
                  ? <p className="small-text ion-text-center">No upcoming trips</p>
                  : <p className="small-text ion-text-center">Loading trips...</p>
                }
                <IonButton
                  className="ion-padding"
                  expand="block"
                  fill="outline"
                  onClick={() => this.props.navigate('trips')}
                >
                  VIEW PAST TRIPS
                </IonButton>
              </div>
            )
          }

        </IonCardContent>
      </IonCard>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsIonicCurrenttrip);

