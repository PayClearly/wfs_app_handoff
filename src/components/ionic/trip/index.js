import { connect, Component } from 'component';
import {
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
} from '@ionic/react';
import { airplane, ellipse, ellipsisVertical } from 'ionicons/icons';

import Store from 'store';
import Components from 'components';

import './index.scss';

// Internal Helper Functions ...
const _formatTailNumber = (tailNumbers) => tailNumbers.join(', ');

function _formatLessThanTen(time) {
  return time < 10 ? `0${time}` : time;
}

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

const _formatAdhocTripTime = (time) => {
  let timeString = `${time.getUTCFullYear()}-`;
  let utcMonth = time.getUTCMonth();
  utcMonth = utcMonth === 11 ? 1 : utcMonth + 1;
  timeString += `${_formatLessThanTen(utcMonth)}-`;
  timeString += `${_formatLessThanTen(time.getUTCDate())} | `;
  timeString += `${_formatLessThanTen(time.getUTCHours())}:${_formatLessThanTen(time.getUTCMinutes())} (GMT)`;
  return timeString;
};

// Helper Functions End

const mapStateToProps = (state) => ({
  status: state.wfs.trips.status,
  adhocStatus: state.wfs.adhocTrips.status,
});

const mapDispatchToProps = (dispatch) => ({
  openLegDetails: (leg, type) => {
    dispatch(Store.router.openModal('Components.ionic.modals.legDetails', { leg, type }));
  },
  syncTrips: () => {
    dispatch(Store.wfs.syncTrips());
  },
});

const wfsUnlinkedMessage = 'com.wfs.graphql.common.exception.DetailedGraphQLException: Tail number not available from external source. Setup may be incomplete.';
const wfsTimedOutMessage = '504: Gateway Time-out';

class componentsIonicTrip extends Component {
  render() {
    if (this.props.data === 'placeholderError') {
      let actionButton = false;
      let errorMessage = 'Something unexpected occurred';
      let actionMessage;
      let action;
      switch (this.props.status.initializingError) {
        case wfsUnlinkedMessage:
          errorMessage = 'Trips are not linked for this tail';
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
        <IonCard className="components_ionic_trip" key={this.props.key} style={this.props.style || {}}>
          <IonCardHeader>
            <IonCardTitle className="ion-text-center">
              {errorMessage}
            </IonCardTitle>
          </IonCardHeader>
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
        </IonCard>
      );
    }
    if (this.props.data === 'placeholderLoading') {
      return (
        <Components.ionic.skeletonCard key={this.props.key} />
      );
    }
    if (this.props.data === 'placeholderNoContext') {
      return (
        <IonCard className="components_ionic_trip" key={this.props.key} style={this.props.style || {}}>
          <IonCardHeader>
            <IonCardTitle className="ion-text-center">
              Please select a tail above
            </IonCardTitle>
          </IonCardHeader>
        </IonCard>
      );
    }
    if (this.props.data === 'placeholderNoCount') {
      return (
        <IonCard className="components_ionic_trip" key={this.props.key} style={this.props.style || {}}>
          <IonCardHeader>
            <IonCardTitle className="ion-text-center">
              There are no trips to display
            </IonCardTitle>
          </IonCardHeader>
        </IonCard>
      );
    }
    const {
      id,
      legs,
      tailNumbers,
      originIcao,
      destinationIcao,
      expense,
    } = this.props.data || {};

    return (
      <IonCard className="components_ionic_trip" key={this.props.data._id || id}>
        <IonCardHeader>
          <IonCardTitle color="primary">
            {originIcao}
            <IonIcon size="small" className="plane-icon" icon={airplane} />
            {destinationIcao}
            <span className="ion-float-end title-expense">${Number.parseFloat(expense).toFixed(2)}</span>
          </IonCardTitle>
          <IonCardSubtitle>
            Tail: {_formatTailNumber(tailNumbers)}
            <span className="ion-float-end">{`ID: #${id}`}</span>
          </IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent className="ion-no-padding">
          <IonList>
            {
              legs.map((leg, index) => {
                const {
                  departAirportLocal,
                  departAirportLocalTimeZoneAbbr,
                  toFlightLeg = {},
                  arriveAirportLocal,
                  arriveAirportLocalTimeZoneAbbr,
                  fromFlightLeg = {},
                } = leg;

                return (
                  <IonItem lines={(index === legs.length - 1) ? 'none' : 'full'} onClick={() => this.props.openLegDetails(leg, this.props.type || null)} key={index}>
                    <IonLabel position="stacked">Leg {index + 1}/{legs.length}</IonLabel>

                    <IonGrid style={{ width: '100%', fontSize: '.9em' }}>
                      <IonRow className="ion-padding-end">
                        <IonCol className="justify-content-center align-items-center" size="1">
                          <IonIcon icon={ellipse} />
                        </IonCol>
                        <IonCol className="align-items-center">
                          <div>{fromFlightLeg.icao}</div>
                        </IonCol>
                        <IonCol size="auto" className="ion-text-right">
                          <div>{this.props.type === 'adhoc' ? _formatAdhocTripTime(departAirportLocal) : _formatAirportLocalTimeZone(departAirportLocal, departAirportLocalTimeZoneAbbr)}</div>
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol className="justify-content-center align-items-center" size="1">

                          <IonIcon icon={ellipsisVertical} />
                        </IonCol>
                      </IonRow>
                      <IonRow className="ion-padding-end ion-padding-bottom">
                        <IonCol className="justify-content-center align-items-center" size="1">
                          <IonIcon icon={ellipse} />
                        </IonCol>
                        <IonCol>
                          <div>{toFlightLeg.icao}</div>
                        </IonCol>
                        <IonCol size="auto" className="ion-text-right">
                          <div>{this.props.type === 'adhoc' ? _formatAdhocTripTime(arriveAirportLocal) : _formatAirportLocalTimeZone(arriveAirportLocal, arriveAirportLocalTimeZoneAbbr)}</div>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonItem>
                );

              })
            }
          </IonList>
        </IonCardContent>
      </IonCard>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsIonicTrip);

