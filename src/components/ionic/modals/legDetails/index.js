import { connect, Component, Fragment } from 'component';
import { IonPage, IonHeader, IonContent, IonToolbar, IonButtons, IonFooter, IonTitle, IonButton, IonIcon, IonText, IonItem, IonList, IonLabel, IonSegment, IonSegmentButton, IonSpinner } from '@ionic/react';
import { airplane, close, build, restaurant, colorFill, bed, car } from 'ionicons/icons';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

import Store from 'store';
import Selectors from 'selectors';

import './index.scss';

const mapStateToProps = (state) => ({
  adhocTripStatus: state.wfs.adhocTrips.status,
  adhocTrips: state.wfs && state.wfs.adhocTrips && state.wfs.adhocTrips.data && state.wfs.adhocTrips.data.items || {},
  adhocTripSelector: Selectors.adhocTrips(state),
});

const mapDispatchToProps = (dispatch) => ({
  closeModal: () => {
    dispatch(Store.router.closeModal());
  },
  deleteAdhocTrip: (id) => {
    dispatch(Store.wfs.updateAdhocTrip(id, { deleted: true }));
  },
  openAdhocTripModal: (data) => {
    dispatch(Store.router.openModal('Components.ionic.modals.tripAdhoc', data));
  },
});

const mapResourcesToProps = (state) => ({});

class components_ionic_modals_legDetail extends Component {

  state = {
    typeIconMap: {
      fuel: colorFill,
      catering: restaurant,
      fbo: build,
      hotel: bed,
      transportation: car,
    },
    show: 'departure',
  };

  componentDidMount() {}

  componentWillUnmount() {}

  componentWillReceiveProps(nextProps = {}) {
    if (this.state.deleting && this.props.adhocTripStatus.updating && !nextProps.adhocTripStatus.updating && nextProps.adhocTripStatus.updated) {
      this.props.closeModal();
    }
  }

  onSegmentChange = (e) => {
    this.setState({ show: e.detail.value });
  };

  deleteAdhocTrip = (id) => {
    this.setState({ deleting: true });
    this.props.deleteAdhocTrip(id);
  };

  render() {
    const { type: tripType } = this.props.data;
    let isAdhocTrip = false;
    if (tripType) {
      isAdhocTrip = true;
    }

    if (this.state.deleting || (isAdhocTrip && !this.props.adhocTripSelector[this.props.data.leg._id])) {
      this.props.closeModal();
    }
    const leg = isAdhocTrip ? this.props.adhocTripSelector[this.props.data.leg._id].legs[0] : this.props.data.leg;

    const departureLegDetails = [{
      label: 'Tail Number',
      data: leg.tailNumber,
    }, {
      label: 'Scheduled Departure',
      data: isAdhocTrip ? _formatAdhocTripTime(leg.departAirportLocal) : _formatAirportLocalTimeZone(leg.departAirportLocal, leg.departAirportLocalTimeZoneAbbr),
    }];

    const arrivalLegDetails = [{
      label: 'Tail Number',
      data: leg.tailNumber,
    }, {
      label: 'Scheduled Arrival',
      data: isAdhocTrip ? _formatAdhocTripTime(leg.arriveAirportLocal) : _formatAirportLocalTimeZone(leg.arriveAirportLocal, leg.arriveAirportLocalTimeZoneAbbr),
    }];

    return (
      <IonPage className="components_ionic_modals_legDetail">
        <IonHeader>
          <IonToolbar>
            <IonTitle color="primary" slot="start">
              <IonText className="icao">{leg.fromFlightLeg.icao}</IonText>
              <IonIcon className="plane-icon" size="small" icon={airplane} />
              <IonText className="icao">{leg.toFlightLeg.icao}</IonText>
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={this.props.closeModal}>
                <IonIcon size="large" icon={close} color="light" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
          <IonSegment value={this.state.show} onIonChange={this.onSegmentChange}>
            <IonSegmentButton value="departure">
              <IonLabel color="light">Departure</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="arrival">
              <IonLabel color="light">Arrival</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonHeader>

        <IonContent fullscreen>
          <SwitchTransition mode="out-in">

            <CSSTransition
              classNames="leg-details-transitioner"
              timeout={100}
              key={this.state.show}
            >
              <div className="leg-detail-container" key={this.state.show}>
                { this.state.show === 'departure' && (
                  <>
                    <IonList className="leg-details ion-padding" lines="none">
                      <IonLabel>LEG DETAILS</IonLabel>
                      {
                        departureLegDetails.map(({ label, data }, index) => (
                          <IonItem style={{ alignItems: 'flex-start' }} className={index === 0 ? 'ion-padding-top' : ''}>
                            <IonText style={{ marginTop: '0px' }} slot="start">{label}</IonText>
                            <IonText slot="end" className="ion-text-right">{data}</IonText>
                          </IonItem>
                        ))
                      }
                    </IonList>
                    { leg.departLogisticsServices && !!leg.departLogisticsServices.length && leg.departLogisticsServices.some((val) => (isAdhocTrip ? val && val[1] && val[1]._id : val.providerName)) && (
                      <IonList className="ion-padding" lines="none">
                        <IonLabel>SERVICES REQUESTED</IonLabel>
                        {
                          !isAdhocTrip
                          ? leg.departLogisticsServices.map(({
                              comments, providerName, status, type,
                            }) => {
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
                          : leg.departLogisticsServices.map((val) => {
                            if (!val[1]._id) { return null; }
                            return (
                              <IonItem style={{ display: 'flex' }} className="ion-padding-top ion-justify-content-start">
                                <IonIcon className="service-icon" icon={this.state.typeIconMap[val[0].toLowerCase()]} />
                                <div>
                                  <div className="ion-text-capitalize">{val[0]}</div>
                                  <div>{val[1]._id}</div>
                                  {/* { comments && <div>{comments}</div> } */}
                                </div>
                              </IonItem>
                            );
                          })
                        }
                      </IonList>
                    )}
                  </>
                )}
                { this.state.show === 'arrival' && (
                  <>
                    <IonList className="leg-details ion-padding" lines="none">
                      <IonLabel>LEG DETAILS</IonLabel>
                      {
                        arrivalLegDetails.map(({ label, data }, index) => (
                          <IonItem style={{ alignItems: 'flex-start' }} className={index === 0 ? 'ion-padding-top' : ''}>
                            <IonText style={{ marginTop: '0px' }} slot="start">{label}</IonText>
                            <IonText slot="end" className="ion-text-right">{data}</IonText>
                          </IonItem>
                        ))
                      }
                    </IonList>
                    { leg.arrivalLogisticsServices && !!leg.arrivalLogisticsServices.length && leg.arrivalLogisticsServices.some((val) => (isAdhocTrip ? val && val[1] && val[1]._id : val.providerName)) && (
                      <IonList className="ion-padding" lines="none">
                        <IonLabel>SERVICES REQUESTED</IonLabel>
                        {
                          !isAdhocTrip
                          ? leg.arrivalLogisticsServices.map(({
                              comments, providerName, status, type,
                          }) => {
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
                          : leg.arrivalLogisticsServices.map((val) => {
                            if (!val[1]._id) { return null; }
                            return (
                              <IonItem style={{ display: 'flex' }} className="ion-padding-top ion-justify-content-start">
                                <IonIcon className="service-icon" icon={this.state.typeIconMap[val[0].toLowerCase()]} />
                                <div>
                                  <div className="ion-text-capitalize">{val[0]}</div>
                                  <div>{val[1]._id}</div>
                                  {/* { comments && <div>{comments}</div> } */}
                                </div>
                              </IonItem>
                            );
                          })
                        }
                      </IonList>
                    )}
                  </>
                )}
              </div>
            </CSSTransition>
          </SwitchTransition>
        </IonContent>
        { isAdhocTrip
          && (
            <IonFooter>
              <IonToolbar className="ion-padding-horizontal ion-padding-bottom">
                <IonButton
                  className="ion-text-uppercase"
                  expand="block"
                  fill="outline"
                  color="primary"
                  onClick={() => this.props.openAdhocTripModal(this.props.adhocTrips[leg._id])}
                  disabled={this.props.adhocTripStatus.updating}
                >
                  { this.props.adhocTripStatus.updating ? <IonSpinner name="crescent" /> : 'EDIT' }
                </IonButton>
                <IonButton
                  className="ion-text-uppercase"
                  expand="block"
                  fill="outline"
                  color="danger"
                  onClick={() => this.deleteAdhocTrip(leg._id)}
                  disabled={this.props.adhocTripStatus.updating}
                >
                  { this.props.adhocTripStatus.updating ? <IonSpinner name="crescent" /> : 'DELETE' }
                </IonButton>
              </IonToolbar>
            </IonFooter>
        )}
      </IonPage>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_legDetail);

const _formatAirportLocalTimeZone = (time, timezone) => {
  const splitTime = time.split('T');
  let timeString = splitTime[0];
  timeString += ' | ';
  timeString += splitTime[1].split('-')[0].split(':')[0];
  timeString += ':';
  timeString += splitTime[1].split('-')[0].split(':')[1];
  timeString += ` (${timezone})`;
  return timeString;
};

function _formatLessThanTen(time) {
  return time < 10 ? `0${time}` : time;
}

const _formatAdhocTripTime = (time) => {
  // 'Fri, 14 Oct 2022 23:08:24 GMT' '2022-10-14 | 23:08 (GMT)'
  let timeString = `${time.getUTCFullYear()}-`;
  let utcMonth = time.getUTCMonth();
  utcMonth = utcMonth === 11 ? 1 : utcMonth + 1;
  timeString += `${_formatLessThanTen(utcMonth)}-`;
  timeString += `${_formatLessThanTen(time.getUTCDate())} | `;
  timeString += `${_formatLessThanTen(time.getUTCHours())}:${_formatLessThanTen(time.getUTCMinutes())} (GMT)`;
  return timeString;
};

