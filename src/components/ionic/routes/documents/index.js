import { connect, Component, Fragment } from 'component';
import { IonLabel, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonSegment, IonSegmentButton, IonSpinner } from '@ionic/react';
import { filterOutline, caretDownSharp } from 'ionicons/icons';

import {
  DEFAULT_SEARCH_RADIUS,
  TODAY_VALUE,
} from './constants.js';

import {
  DOC_STRING,
  DOC_DISPLAY,
  DOC_FILTER_OPTIONS,
  DEFAULT_DOC_FILTERS,
  DOC_FILTERS_TO_DISPLAY_NAMES,
} from './constants/serviceProviderDocuments.js';

import {
  SO_STRING,
  SO_DISPLAY,
  SO_FILTER_OPTIONS,
  DEFAULT_SO_FILTERS,
  SO_FILTERS_TO_DISPLAY_NAMES,
} from './constants/salesOrders.js';

import {
  OFA_STRING,
  OFA_DISPLAY,
  OFA_FILTER_OPTIONS,
  DEFAULT_OFA_FILTERS,
  OFA_FILTERS_TO_DISPLAY_NAMES,
} from './constants/openFuelAuthorizations.js';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import * as device from '../../../../store/device';

import './index.scss';

const _displayToOrder = {
  Oldest: 'ASC',
  Newest: 'DESC',
};

const generateInitialState = (type, filterLabelKeys, filterOptions, defaultFilters) => ({
  modalIsOpen: false,
  modalSize: type === DOC_STRING ? 'md' : 'lg',
  filterLabelKeys,
  filterOptions,
  defaultFilters,
  activeFilters: defaultFilters,
});

const setDateValues = (show, activeFilters) => {
  let fromDate, toDate;
  const dateOrder = _displayToOrder[activeFilters.dateOrder];
  if (!show) {
    return null;
  }
  if (show === DOC_STRING) {
    fromDate = activeFilters.dateRange;
    toDate = TODAY_VALUE;
  } else {
    fromDate = activeFilters.dateDirection === 'Past' ? activeFilters.dateRange : TODAY_VALUE;
    toDate = activeFilters.dateDirection === 'Upcoming' ? activeFilters.dateRange : TODAY_VALUE;
  }

  return { dateOrder, fromDate, toDate };
};

const mapStateToProps = (state, props) => {
  return ({
    serviceProviderDocuments: state.wfs.serviceProviderDocuments,
    salesOrders: state.wfs.salesOrders,
    openFuelAuthorizations: state.wfs.openFuelAuthorizations,
    context: state.wfs.data.context,
    airports: _resolve(state, 'wfs.airportsGeolocation', {}),
    geolocation: _resolve(state, 'device.geolocation', {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    syncDocuments: ({ type, icao, dateOrder, toDate, fromDate }) => {
      dispatch(Store.wfs.syncDocuments({ type, icao, dateOrder, toDate, fromDate }));
    },
    fetchDocuments: ({ type, icao, dateOrder, toDate, fromDate, isUpdate, event }) => {
      dispatch(Store.wfs.fetchDocuments({ type, icao, dateOrder, toDate, fromDate, isUpdate, event }));
    },
    searchNearby: (radius) => {
      dispatch(Store.wfs.getAirport(radius));
    },
    openAirportSelectModal: (currentAirport, radius, locationDisabled, setParams, recentAirports) => {
      dispatch(Store.router.openModal('Components.ionic.modals.airportSelect', { currentAirport, radius, locationDisabled, setParams, recentAirports }));
    },
    showToast: (message, color = 'primary', duration = 1000) => {
      device.showToast({ message, duration, color })(dispatch);
    },
    dismissToast: () => {
      device.dismissToast()(dispatch);
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_routes_documents extends Component {
  // If geolocation errors out, then locationDisabled = true. Disables Range selection and use on airport select modal
  // Recently used icaos will be replaced by favoriting airpots (similar to tail select) but currently keeps a list to display in airport select modal
  state = {
    show: DOC_STRING,
    longFetchIndicator: false,
    airportICAO: '',
    radius: DEFAULT_SEARCH_RADIUS,
    initialized: false,
    locationDisabled: false,
    recentlyUsedIcaos: [],
    [DOC_STRING]: generateInitialState(DOC_STRING, DOC_FILTERS_TO_DISPLAY_NAMES, DOC_FILTER_OPTIONS, DEFAULT_DOC_FILTERS),
    [SO_STRING]: generateInitialState(SO_STRING, SO_FILTERS_TO_DISPLAY_NAMES, SO_FILTER_OPTIONS, DEFAULT_SO_FILTERS),
    [OFA_STRING]: generateInitialState(OFA_STRING, OFA_FILTERS_TO_DISPLAY_NAMES, OFA_FILTER_OPTIONS, DEFAULT_OFA_FILTERS),
  };

  componentDidMount() {
    // If we have a location and a tailnumber, sync the documents.
    const airportICAO = this.state.airportICAO || this.props[this.state.show].collections.lastUsedIcao;
    if (this.props.context.tailNumber && !!airportICAO) {
      this.setState({ airportICAO });
      this.syncDocuments(airportICAO);
    }
    /* GEO */
    if (this.props.context.tailNumber && !airportICAO) {
      // Search nearby airports if we have a geolocation AND we haven't called searchNearby
      const locationSet = this.props.geolocation.status && this.props.geolocation.status.fetched && this.props.geolocation.data.location.timestamp !== null;
      const nearbyAirportsSearched = this.props.airports.status && (this.props.airports.status.fetching || this.props.airports.status.fetched);
      if (locationSet && !nearbyAirportsSearched) {
        this.setState({ initialized: true });
        this.props.searchNearby(this.state.radius);
      }
    }
    /* End of GEO */
  }

  componentWillReceiveProps(nextProps = {}) {
    const { context, geolocation, airports } = nextProps;
    const { tailNumber } = context;
    const { status: geoStatus, data: geoData } = geolocation;
    const { status: airportStatus, collections: airportCollections, data: airportData } = airports;
    const { show, airportICAO, radius, recentlyUsedIcaos, initialized, longFetchIndicator } = this.state;
    const nextDocumentStoreStatus = nextProps[show].status;

    if (this.props.context.tailNumber && this.props.context.tailNumber !== tailNumber) {
      this.syncDocuments(airportICAO, true);
    }

    if (longFetchIndicator && this.props[show].status.initializing && (nextDocumentStoreStatus.initialized || nextDocumentStoreStatus.initializeError)) {
      clearTimeout(longFetchIndicator);
      this.props.dismissToast();
      this.setState({ longFetchIndicator: false });
    }
    /* GEO */
    if (tailNumber) {
      // If we have a geolocation and we haven't initialized, then initialize
      const locationSet = geoStatus && geoStatus.fetched && geoData.location.timestamp !== null;
      const locationError = geoStatus && geoStatus.fetchingError;

      if (!initialized) {
        if (locationSet) {
          this.setState({ initialized: true });
          this.props.searchNearby(radius);
        }

        if (locationError) {
          this.setState({ initialized: true, locationDisabled: true, airportICAO: null });
        }
      }

      const noAirport = airportICAO === '';
      // If there is a nearest airport, set it. Else set the airport to null to handle in render. Append to recently used if not included
      if (initialized && noAirport && airportStatus.fetched) {
        const nearestAirports = Object.values(airportCollections.nearest);

        if (nearestAirports.length > 0) {
          const recent = [...recentlyUsedIcaos];
          const nearestAirport = airportData[nearestAirports[0]];

          if (!recent.some(val => val._id === nearestAirport._id)) {
            recent.push(nearestAirport);
          }

          this.setState({ airportICAO: nearestAirports[0], recentlyUsedIcaos: recent });
          this.syncDocuments(nearestAirports[0]);
        } else {
          this.setState({ airportICAO: null });
        }
      }
    }
    /* End of GEO */

    // If we haven't updated our current items in the store, and we have a new set of items, then update
    const nextDocumentCollections = nextProps[show].collections;
    const nextDocumentData = nextProps[show].data;
    if (nextDocumentCollections && nextDocumentCollections.icaoInfo[airportICAO] && nextDocumentData[airportICAO] && !nextDocumentCollections.icaoInfo[airportICAO].updated && !nextDocumentStoreStatus.updating) {
      this.fetchDocuments({ isUpdate: true });
    }
  }

  componentWillUnmount() {}

  // Reset state on segment change, call sync to mimic didMount sync
  onSegmentChange = (e) => {
    if (this.state.longFetchIndicator) {
      clearTimeout(this.state.longFetchIndicator);
      this.props.dismissToast();
    }
    this.setState({ show: e.detail.value, longFetchIndicator: false }, () => {
      this.syncDocuments(this.state.airportICAO, true);
    });
  };

  // Passed to airport select modal, allows for icao and radius to persist.
  // Will sync documents based on new icao
  setParams = (airport, radius) => {
    if (this.state.longFetchIndicator) {
      clearTimeout(this.state.longFetchIndicator);
      this.props.dismissToast();
    }
    const recent = this.state.recentlyUsedIcaos;
    if (!recent.some(val => val._id === airport._id)) {
      recent.push(airport);
    }
    this.setState({ airportICAO: airport.icao, radius, recentlyUsedIcaos: recent });
    this.syncDocuments(airport.icao);
  };

  setFilters = (filters) => {
    const { longFetchIndicator, show, airportICAO } = this.state;

    if (longFetchIndicator) {
      clearTimeout(longFetchIndicator);
      this.props.dismissToast();
    }

    this.setState({ [show]: { ...this.state[show], activeFilters: filters } }, () => {
      this.syncDocuments(airportICAO, true);
    });
  };

  pressedApply = () => {
    const { show } = this.state;
    this.setState({ [show]: { ...this.state[show], modalIsOpen: false } });
  };

  // Will call sync on the specific document type and icao set
  // If it has already been synced, then it will call fetch
  syncDocuments = (airportICAO, newFilter = false) => {
    if (!this.props.context.tailNumber) {
      return null;
    }

    this.setState({ longFetchIndicator: setTimeout(() => this.props.showToast('Fetching documents is taking longer than expected, please wait...', 'primary', 2500), 10000) });

    if (!newFilter && this.props[this.state.show].collections.icaoInfo[airportICAO] && this.props[this.state.show].collections.icaoInfo[airportICAO].initialized) {
      return this.fetchDocuments({ airportICAO });
    }

    const icao = airportICAO;
    const activeFilters = this.state[this.state.show].activeFilters;
    const { dateOrder, fromDate, toDate } = setDateValues(this.state.show, activeFilters);

    this.props.syncDocuments({ type: this.state.show, icao, dateOrder, toDate, fromDate });
  };

  // Event will stop the infinite scroll from displaying the spinner/msg
  // isUpdate tells store to not fetch the next set, but to fetch the number of documents we have and update/see if there are new docs
  // unusedProp was a dateOrder param but was never passed as anything but null, will remove
  fetchDocuments = ({ event = null, isUpdate = false, airportIcao = null }) => {
    if (!this.props.context.tailNumber) return null;
    const icao = !airportIcao ? this.state.airportICAO : airportIcao;
    const activeFilters = this.state[this.state.show].activeFilters;

    const { dateOrder, fromDate, toDate } = setDateValues(this.state.show, activeFilters);

    this.props.fetchDocuments({ type: this.state.show, icao, dateOrder, toDate, fromDate, isUpdate, event });
  };

  showFilter = () => {
    return this.state[this.state.show].activeFilters.dateOrder;
  };

  closeFilterModal = () => {
    this.setState({ [this.state.show]: { ...this.state[this.state.show], modalIsOpen: false } });
  };

  openFilterModal = () => {
    this.setState({ [this.state.show]: { ...this.state[this.state.show], modalIsOpen: true } });
  };

  render() {
    const { show, airportICAO, radius, recentlyUsedIcaos } = this.state;
    const { collections, status, data } = this.props[show];
    const { lastUsedIcao, icaoInfo } = collections || {};
    const { initializing, initializeError } = status || {};
    const tailNumber = this.props.context.tailNumber;
    // If there is no nearby airport or location failure
    // If we have a last used in the store then set it
    // Else open select modal to use search feature only
    if (airportICAO === null) {
      if (lastUsedIcao) {
        this.setState({ airportICAO: lastUsedIcao });
        this.fetchDocuments({ isUpdate: true, airportIcao: lastUsedIcao });
      } else {
        this.props.openAirportSelectModal(airportICAO, radius, true, this.setParams, recentlyUsedIcaos);
      }
    }

    const showDocuments = airportICAO && icaoInfo && icaoInfo[airportICAO] && icaoInfo[airportICAO].initialized && !initializing;
    const documentError = initializeError || false;
    const tailSet = !!tailNumber;
    let documentsOrder = [];
    let documents = [];
    // We must get the order from collections and map the data sequentially
    // Based on filter we must splice together oldest and newest arrays from collection
    if (tailSet && airportICAO && showDocuments && !documentError && data && data[airportICAO] && Object.keys(data[airportICAO]).length && icaoInfo && icaoInfo[airportICAO] && icaoInfo[airportICAO].initialized) {
      const { newest, oldest } = icaoInfo[airportICAO];
      const order = _displayToOrder[this.state[show].activeFilters.dateOrder] === 'DESC' ? newest : oldest;
      const other = order === newest ? oldest : newest;

      documentsOrder = [...order];
      documentsOrder.push(...other.filter(doc => !documentsOrder.includes(doc._id)).reverse());
      documents = documentsOrder.map(id => data[airportICAO][id]);
    }
    return (
      <Fragment>
        <IonSegment value={this.state.show} onIonChange={this.onSegmentChange}>
          <IonSegmentButton value={DOC_STRING}>
            <IonLabel>{DOC_DISPLAY}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value={SO_STRING}>
            <IonLabel>{SO_DISPLAY}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value={OFA_STRING}>
            <IonLabel>{OFA_DISPLAY}</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        <Components.ionic.filters.filterModal
          type="documentsFilter"
          key={this.state.show}
          isOpen={this.state[this.state.show].modalIsOpen}
          close={this.closeFilterModal}
          size={this.state[this.state.show].modalSize}
          roundedCorners
          setFilters={this.setFilters}
          pressApply={this.pressedApply}
          filterMapping={this.state[this.state.show].filterLabelKeys}
          filterOptions={this.state[this.state.show].filterOptions}
          activeFilters={this.state[this.state.show].activeFilters}
          defaultFilters={this.state[this.state.show].defaultFilters}
        />
        <div className="components_ionic_routes_documents">
          <div className="documents-header ion-margin">
            <span className="filter-button ion-text-uppercase" onClick={() => this.props.context.tailNumber && this.openFilterModal()}>
              {this.showFilter()}
              <IonIcon icon={filterOutline} />
            </span>
            <div className="icao-select">
              { /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
              <span className="airport-select-button no-margin" onClick={() => this.props.context.tailNumber && this.props.openAirportSelectModal(this.state.airportICAO, this.state.radius, this.state.locationDisabled, this.setParams, this.state.recentlyUsedIcaos)}>
                {(this.state.airportICAO === '' || this.state.airportICAO === null) ?
                  (this.props.context.tailNumber && <IonSpinner className="aiport-spinner" name="dots" color="light" /> || null)
                  :
                  <IonLabel color="light">{this.state.airportICAO}</IonLabel>
                }
                { this.props.context.tailNumber && <IonIcon className="select-icon" color="light" slot="end" icon={caretDownSharp} />}
              </span>
            </div>
          </div>

          { showDocuments &&
            documents.map((val, index) => {
              if (!val) return null;
              return <Components.ionic.document document={val} type={this.state.show === DOC_STRING ? val.type : this.state.show} lastItem={index === documents.length - 1} />;
            })
          }
          {
            !tailSet &&
            <p style={{ textAlign: 'center' }}>Please select a tail</p>
          }
          { !showDocuments && tailSet && !documentError &&
            (
              <Fragment>
                <Components.ionic.skeletonDocument type={this.state.show} />
                <Components.ionic.skeletonDocument type={this.state.show} />
                <Components.ionic.skeletonDocument type={this.state.show} />
                <Components.ionic.skeletonDocument type={this.state.show} />
                <Components.ionic.skeletonDocument type={this.state.show} lastItem="true" />
              </Fragment>
            )
          }
          { tailSet &&
            <IonInfiniteScroll
              onIonInfinite={event => this.fetchDocuments({ event })}
            >
              <IonInfiniteScrollContent
                loadingSpinner="dots"
                loadingText="Loading more..."
              />
            </IonInfiniteScroll>}
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_routes_documents);

// GENERATOR_TYPE='component';
