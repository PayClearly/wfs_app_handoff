import { connect, Component } from 'component';
import { IonActionSheet, IonIcon, IonList, IonSegment, IonLabel, IonSegmentButton, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/react';
import { funnel, filterOutline } from 'ionicons/icons';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state) => ({
  tailContext: state.wfs.data.context,
  tailContextStatus: state.wfs.status,
  adhocTrips: Selectors.adhocTrips(state),
  adhocTripsStatus: state.wfs.adhocTrips.status,
  trips: Selectors.trips(state),
  tripsStatus: state.wfs.trips.status,
  tripsCollections: state.wfs.trips.collections,
});

const mapDispatchToProps = (dispatch) => ({
  syncTrips: () => {
    dispatch(Store.wfs.syncTrips());
  },
  fetchTrips: (event) => {
    dispatch(Store.wfs.fetchTrips(event));
  },
});

class componentsIonicRoutesTrips extends Component {
  state = {
    showFilterOptions: false,
    schedAeroFilterBy: 'Newest',
    adhocFilterBy: 'Newest',
    filterOptions: ['Newest', 'Oldest'],
    show: 'schedAero',
  };

  componentDidMount() {
    if (this.props.tailContext.tailNumber) {
      this.props.syncTrips();
    }
  }

  componentWillUnmount() { }

  onSegmentChange = (e) => {
    this.setState({ show: e.detail.value });
  };

  schedAeroTrips = () => {
    const {
      tailContext,
      tailContextStatus,
      trips,
      tripsCollections,
      tripsStatus,
    } = this.props;

    // Loading state
    // WFS context has not been set (aka still logging in and pulling customers)
    // WFS context was set and pulling trips
    const wfsContextInitializing = tailContextStatus.initializing === undefined || tailContextStatus.initializing;
    const wfsContextLoading = wfsContextInitializing && !tailContextStatus.initialized && !tailContextStatus.initializingError;
    const tripsInitializing = tripsStatus.initializing;
    const loading = (wfsContextLoading || tripsInitializing);

    if (loading) {
      return (
        <>
          <Components.ionic.trip data="placeholderLoading" key="schedLoading1" />
          <Components.ionic.trip data="placeholderLoading" key="schedLoading2" />
          <Components.ionic.trip data="placeholderLoading" key="schedLoading3" />
        </>
      );
    }

    // Requires Info
    // Tail has not been set
    const contextTailNumber = tailContext.tailNumber;

    if (!contextTailNumber) {
      return (
        <Components.ionic.trip data="placeholderNoContext" key="schedNoContext" style={{ marginTop: '25vh' }} />
      );
    }

    // Errored out
    if (tripsStatus.initializingError) {
      return (
        <Components.ionic.trip data="placeholderError" type="schedAero" style={{ marginTop: '25vh' }} />
      );
    }
    // Happy Path
    // No data
    // Data
    const { recent, oldest } = tripsCollections;
    const { schedAeroFilterBy } = this.state;
    const tripOrdering = schedAeroFilterBy === 'Newest' ? recent : oldest;
    const hasTrips = (tripOrdering && tripOrdering.length) || false;

    if (!hasTrips) {
      return (
        <Components.ionic.trip data="placeholderNoCount" key="schedAeroNoTrips" style={{ marginTop: '25vh' }} />
      );
    }

    // The syncing is done and we have trips
    // The separation of returns is to address content not rendering when filtering was switched
    if (schedAeroFilterBy === 'Newest') {
      return recent.map((key) => <Components.ionic.trip data={trips[key]} key={trips[key].id} />);
    }

    return (
      oldest.map((key) => <Components.ionic.trip data={trips[key]} key={trips[key].id} />)
    );
  };

  adhocTrips = () => {
    const {
      tailContext,
      tailContextStatus,
      adhocTrips,
      adhocTripsStatus,
    } = this.props;
    // Loading state
    // WFS context has not been set (aka still logging in and pulling customers)
    // WFS context was set and pulling trips
    const wfsContextInitializing = tailContextStatus.initializing === undefined || tailContextStatus.initializing;
    const wfsContextLoading = wfsContextInitializing && !tailContextStatus.initialized && !tailContextStatus.initializingError;
    const tripsFetching = adhocTripsStatus.fetching;
    const loading = (wfsContextLoading || tripsFetching);

    if (loading) {
      return (
        <>
          <Components.ionic.trip data="placeholderLoading" key="adhocLoading1" />
          <Components.ionic.trip data="placeholderLoading" key="adhocLoading2" />
          <Components.ionic.trip data="placeholderLoading" key="adhocLoading3" />
        </>
      );
    }

    // Requires Info
    // Tail has not been set
    const contextTailNumber = tailContext.tailNumber;

    if (!contextTailNumber) {
      return (
        <Components.ionic.trip data="placeholderNoContext" key="adhocNoContext" style={{ marginTop: '25vh' }} />
      );
    }


    const tripData = Object.values(adhocTrips);
    // There are no trips after syncing
    if (!tripData.length) {
      return (
        <Components.ionic.trip data="placeholderNoCount" key="adhocNoTrips" style={{ marginTop: '25vh' }} />
      );
    }
    // Sort the trips
    const orderedTripData = tripData.sort((a, b) => {
      if (this.state.adhocFilterBy === 'Newest') {
        return b.legs[0].departAirportLocal.getTime() - a.legs[0].departAirportLocal.getTime();
      }
      return a.legs[0].departAirportLocal.getTime() - b.legs[0].departAirportLocal.getTime();
    });
    // We have trip data and it is sorted
    return (
      orderedTripData.map((adhocTrip) => (<Components.ionic.trip data={adhocTrip} type="adhoc" key={adhocTrip._id} />))
    );
  };

  render() {
    const actionSheetButtons = this.state.filterOptions.map((option) => ({
      text: option,
      handler: () => this.setState((prevState) => ({ [`${prevState.show}FilterBy`]: option })),
    }));
    actionSheetButtons.push({ text: 'Cancel', role: 'cancel' });

    return (
      <>
        <IonSegment value={this.state.show} onIonChange={this.onSegmentChange}>
          <IonSegmentButton value="schedAero">
            <IonLabel>Scheduled Trips</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="adhoc">
            <IonLabel>Created Trips</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        <div className="trips-header ion-margin">
          <span className="ion-text-uppercase" onClick={() => this.setState({ showFilterOptions: true })}>
            <IonIcon className="ion-padding-end" icon={funnel} />
            {this.state[`${this.state.show}FilterBy`]}
            <IonIcon className="ion-padding-start" icon={filterOutline} />
          </span>
        </div>
        <IonActionSheet
          isOpen={this.state.showFilterOptions}
          onDidDismiss={() => this.setState({ showFilterOptions: false })}
          buttons={actionSheetButtons}
        />

        <IonList>
          {this.state.show === 'schedAero' && this.schedAeroTrips()}
          {this.state.show === 'adhoc' && this.adhocTrips()}
        </IonList>
        {
          this.state.show === 'schedAero'
          && (
            <IonInfiniteScroll
              onIonInfinite={(event) => this.props.fetchTrips(event)}
            >
              <IonInfiniteScrollContent
                loadingSpinner="dots"
                loadingText="Loading more..."
              />
            </IonInfiniteScroll>
          )
        }

      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsIonicRoutesTrips);


