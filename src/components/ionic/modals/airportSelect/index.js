import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonTitle, IonButton, IonButtons, IonHeader, IonToolbar, IonContent, IonList, IonItem, IonLabel, IonIcon, IonListHeader, IonActionSheet, IonSearchbar, IonSpinner, IonItemDivider } from '@ionic/react';
import { caretDownSharp, close, sendSharp } from 'ionicons/icons';

import Store from 'store';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    airportsGeo: state.wfs.airportsGeolocation,
    airportsSearch: state.wfs.airportsSearch,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    searchNearby: (radius) => {
      dispatch(Store.wfs.getAirport(radius));
    },
    searchAirports: (searchString) => {
      dispatch(Store.wfs.searchAirports(searchString));
    },
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_modals_airportSelect extends Component {
  state = {
    usingSearchBar: false,
    showRangeOptions: false,
    distanceSearchOptions: ['10', '25', '50', '75', '100'],
    distanceSearch: 10,
    airportSearchString: '',
  };

  componentDidMount() {
    if (this.props.data.locationDisabled) {
      this.setState({ usingSearchBar: true, distanceSearch: null });
    } else {
      this.setState({ distanceSearch: this.props.data.radius });
    }
  }


  handleClick = (airport) => {
    this.props.data.setParams(airport, this.state.distanceSearch);
    this.props.closeModal();
  }

  // Will search for the nearest airports in (radius) nautical miles, deactivates the searchbar if it was being used
  searchWithRadius = (radius) => {
    this.setState({ usingSearchBar: false, distanceSearch: radius, airportSearchString: '' });
    this.props.searchNearby(radius);
  }

  // Will unfocus the search bar and search for airports using the string entered
  searchForAirports = (e) => {
    let searchString;
    if (e) {
      e.target.blur();
      searchString = e.target.value;
      this.setState({ airportSearchString: e.target.value });
    } else {
      searchString = this.state.airportSearchString;
    }
    this.props.searchAirports(searchString);
  }

  render() {
    const currentAirport = this.props.data.currentAirport;
    const nearestAirports = this.props.airportsGeo.collections.nearest;
    const airports = this.props.airportsGeo.data;

    // Airport items display: ICAO - Airport Name
    // Using searchForAirports all data lives in airport param. airport = Airport Info
    const airportItem = (airport) => {
      if (airport && (airport.airportName || airport.icao)) {
        const airportString = airport.airportName ? `${airport.icao} - ${airport.airportName}` : `${airport.icao}`;
        return (
          <IonItem button key={airport.icao} detail={false} onClick={() => this.handleClick(airport)}>
            <IonLabel color={airport.icao === currentAirport ? 'primary' : 'light'}>{airportString}</IonLabel>
          </IonItem>
        );
      }
      const airportData = airports[airport];
      const chosenAirport = airport === currentAirport;
      return (
        <IonItem button key={airport.icao} detail={false} onClick={() => this.handleClick(airport)}>
          <IonLabel color={chosenAirport ? 'primary' : 'light'}>{`${airport} - ${airportData.airportName}`}</IonLabel>
        </IonItem>
      );
    };
    // Allow user to select a radius between 10 - 100
    // Add a cancel button and No Limit button for when using the search bar
    const rangeSelectButtons = this.state.distanceSearchOptions.map(option => ({
      text: `${option} Nautical Miles`,
      handler: () => this.searchWithRadius(parseInt(option, 10)),
    }));
    rangeSelectButtons.push({ text: 'No Limit', handler: () => this.setState({ usingSearchBar: true }) });
    rangeSelectButtons.push({ text: 'Cancel', role: 'cancel' });
    const noRangeText = this.props.data.locationDisabled ? 'Unavailable' : 'No Limit';

    return (
      <div className="components_ionic_modals_airportSelect ion-float-end">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Airports</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={this.props.closeModal}>
                <IonIcon size="large" icon={close} color="light" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-content-list">
          <IonList style={{ paddingTop: '0px' }} lines="full">
            <IonListHeader lines="none">
              <div className="range-title ion-text-uppercase">
                <span className="range-title-span">Airports Within</span>
              </div>
              <IonButtons>
                <IonButton className={`range-button button-round${!this.state.usingSearchBar ? ' active' : ''}`} disabled={this.state.distanceSearch === null} fill="none" onClick={() => this.setState({ showRangeOptions: true })}>
                  {this.state.usingSearchBar ? noRangeText : `${this.state.distanceSearch} Nautical Miles`}
                  <IonIcon className="select-icon" slot="end" icon={caretDownSharp} />
                </IonButton>
              </IonButtons>
            </IonListHeader>
            <IonListHeader className="airport-search-header" lines="full">
              <IonSearchbar
                className="airport-search"
                value={this.state.airportSearchString}
                animated
                placeholder={this.props.data.locationDisabled ? 'Search for an airport' : 'Search for an airport instead'}
                onKeyPress={(e) => { if (e.key === 'Enter') return this.searchForAirports(e); }}
                onIonFocus={() => { if (!this.state.usingSearchBar) return this.setState({ usingSearchBar: true }); }}
                onIonChange={e => this.setState({ airportSearchString: e.target.value })}
              />
              <IonIcon className={`airport-search-icon${this.state.usingSearchBar ? ' active' : ''}`} icon={sendSharp} onClick={() => this.state.usingSearchBar ? this.searchForAirports() : null} />
            </IonListHeader>
            {this.state.usingSearchBar &&
              <Fragment>
                {
                  (this.props.airportsSearch && this.props.airportsSearch.status && !this.props.airportsSearch.status.fetching && Object.keys(this.props.airportsSearch.data).length !== 0) &&
                  Object.values(this.props.airportsSearch.data).map(airport => airportItem(airport))
                }
                {
                  (Object.keys(this.props.airportsSearch.data).length === 0 && !this.props.airportsSearch.status.fetching) &&
                  <IonItem disabled style={{ '--padding-start': '0px', '--inner-padding-end': '0px' }}>
                    <div className="center-content-item">
                      No Airports Match Your Search.
                    </div>
                  </IonItem>
                }
                {
                  this.props.airportsSearch.status.fetching &&
                  <IonItem disabled style={{ '--padding-start': '0px', '--inner-padding-end': '0px' }}>
                    <div className="center-content-item">
                      Searching for airports
                      <IonSpinner className="loading-spinner" name="dots" />
                    </div>
                  </IonItem>
                }
              </Fragment>
            }
            {!this.state.usingSearchBar &&
              <Fragment>
                {
                  (this.props.airportsGeo && this.props.airportsGeo.status && this.props.airportsGeo.status.fetched && !this.props.airportsGeo.status.fetching && nearestAirports && Object.keys(nearestAirports).length > 0) &&
                  Object.values(nearestAirports).map(icao => airportItem(this.props.airportsGeo.data[icao]))
                }
                {
                  this.props.airportsGeo && this.props.airportsGeo.status && this.props.airportsGeo.status.fetched && nearestAirports && Object.keys(nearestAirports).length === 0 &&
                  <IonItem className="placeholder-item" disabled style={{ '--padding-start': '0px', '--inner-padding-end': '0px' }}>
                    <div className="center-content-item">
                      No Airports Nearby.
                    </div>
                  </IonItem>
                }
                {this.props.airportsGeo.status.fetching &&
                  <IonItem disabled style={{ '--padding-start': '0px', '--inner-padding-end': '0px' }}>
                    <div className="center-content-item">
                      Searching for nearby airports
                      <IonSpinner className="loading-spinner" name="dots" />
                    </div>
                  </IonItem>
                }
              </Fragment>
            }
            {this.props.data.recentAirports.length !== 0 &&
              <IonItemDivider className="favorite-divider">
                <IonLabel className="favorite-label">
                  Recently Used Airports
                </IonLabel>
              </IonItemDivider>
            }
            {
              this.props.data.recentAirports.length !== 0 &&
              this.props.data.recentAirports.map(recentAirport => airportItem(recentAirport))
            }
          </IonList>
        </IonContent>
        <IonActionSheet
          isOpen={this.state.showRangeOptions}
          backdropDismiss
          animated
          keyboardClose
          cssClass="range-action-sheet"
          style={{ '--button-background': 'white', '--color': 'white' }}
          onDidDismiss={() => this.setState({ showRangeOptions: false })}
          buttons={rangeSelectButtons}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_airportSelect);


