import { connect, Component } from 'component';
import { IonPage, IonContent, IonRefresherContent, IonRefresher } from '@ionic/react';
import React from 'react';
import { chevronDownOutline } from 'ionicons/icons';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    cardExpanded: state.router.cardExpanded,
    context: state.wfs.data.context,
    router: state.router.route,
    modals: state.router.modals,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateSelectedCard: (data) => {
      return dispatch(Store.router.toggleCardEnlarged(data));
    },
    sync: (context, event) => {
      return dispatch(Store.wfs.sync(context, event));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_tablayout extends Component {
  state = {
    scrollingDown: false,
    userTouch: false,
    hideFAB: false,
  };

  componentDidUpdate(prevProps = {}) {
    if (prevProps.router.name !== this.props.router.name) {
      this.setState({ userTouch: false, scrollingDown: false });
    }
  }

  handleScrollHiding = (event) => {
    // Only called if the user has touched the screen, avoids bug where routes store scroll position
    const routeDiv = Object.values(event.target.childNodes).filter(child => child.className.includes('components_ionic_routes'))[0];
    if (routeDiv && routeDiv.clientHeight && event.target.clientHeight > routeDiv.clientHeight) return;
    // ^ This screen is too small to have scrolling, aka don't hide the button
    if (event.detail.startY === event.detail.currentY) return;
    // ^ ignore very first listen of scroll, as we cannot determine if up or down, aka don't hide the button
    if (event.detail.startY < event.detail.currentY) {
      if (!this.state.scrollingDown) this.setState({ scrollingDown: true });
    } else {
      if (this.state.scrollingDown && (event.detail.deltaY < -300 || event.detail.scrollTop < 200)) this.setState({ scrollingDown: false });
    }
  };

  toggleFAB = ({ hidden }) => {
    this.setState({ hideFAB: hidden });
  };

  render() {
    const acceptedRefresherRoutes = ['wallet', 'trips', 'expenses', 'account', 'documents'];
    const onAcceptedRoute = acceptedRefresherRoutes.includes(this.props.router.name);
    const modalOpen = this.props.modals.length !== 0;

    // This is to pass the children a prop that will allow hiding of the FAB button
    const childrenArray = React.Children.toArray(this.props.children);
    const elements = childrenArray.map((child) => {
      return React.cloneElement(child, { toggleFAB: this.toggleFAB });
    });
    return (
      <IonPage
        className="components_ionic_tablayout"
      >
        <Components.ionic.header
          style={{ order: this.props.cardExpanded ? '1' : '-1' }}
        />
        <IonContent scrollEvents="true" onIonScroll={(this.props.context.tailNumber && this.state.userTouch) ? this.handleScrollHiding : null} onTouchStart={() => this.setState({ userTouch: true })}>
          <Components.ionic.fab hidden={this.state.hideFAB} small={this.state.scrollingDown} />
          <IonRefresher
            slot="fixed"
            onIonRefresh={this.props.sync}
            disabled={!onAcceptedRoute || modalOpen}
          >
            <IonRefresherContent
              pullingIcon={chevronDownOutline}
              refreshingSpinner="dots"
            />
          </IonRefresher>
          {elements}
          <Components.ionic.toast />
        </IonContent>
        <Components.ionic.tabnav />
      </IonPage>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_tablayout);


