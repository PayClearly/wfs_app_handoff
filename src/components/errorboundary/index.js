import { Component } from 'react';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
import errorsAPI from 'api/errors';

class components_errorboundary extends Component {

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }



  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    const store = window.store.getState();

    const accountContext = _try(() => store.accounts.data.items[store.account.data.id].name, 'unknown');
    const organizationContext = _try(() => store.organizations.data.items[store.organization.data.id].name, 'unknown');
    const route = store.router.route.path;
    const previousRoute = store.router.previousRoute ? store.router.previousRoute.path : 'Initial';
    const user = store.user.profile.data.item;

    const errorObject = {
      browserVersion: window.navigator.appVersion,
      errorName: error.name,
      message: error.message,
      stack: [error.stack.split('\n')[0], ...error.stack.split('\n').filter(n => n.includes('at components_')).map(n => n.trim())].join(', '),
      route,
      accountContext,
      organizationContext,
      previousRoute,
      _at: Date.now(),
      userName: user.name,
      userEmail: user.email,
      userId: user._id,
      at: (new Date()).toString(),
      appName: _resolve(store, 'appConfig.data.metadata.name', 'unknown'),
      appVersion: _resolve(store, 'appConfig.data.metadata.version', 'unknown'),
      componentStack: info.componentStack.split('\n').filter(n => n.includes('in components_')).map(n => n.split('in ')[1]).join(' > ') || info.componentStack,
    };
    if (!window.location.href.includes('local')) {
      errorsAPI.logError(errorObject).then(({ data: firebaseData }) => {
        const firebaseRef = firebaseData.name;
        errorObject.firebaseRef = firebaseRef;
        window.mixpanel.track('Error', errorObject);
      });
    }

  }


  render() {
    if (this.state.hasError) {
      const currentYear = (new Date()).getFullYear();

      if (_resolve(window.store.getState(), 'appConfig.data.metadata.name', '') === 'wfsapp') {
        return (
          <div className="text-center ml-auto mr-auto mt-3 mb-3 container d-flex flex-column justify-content-between" style={{ 'maxWidth': '500px', "color": 'white', 'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center', 'marginTop': 'var(--ion-safe-area-top, 12px)' }}>
            <div style={{ 'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center' }}>
              <div style={{ 'fontSize': '8rem' }}>Oops!</div>
              <h3 className="text-uppercase">Something unexpected happened</h3>
              <p className="p-3 m-3" style={{ 'textAlign': 'center' }}>
                We apologize for any inconvenience, but an unexpected error has occurred.
                Detailed information about this error has automatically been recorded.
              </p>
            </div>
            <div style={{ position: 'absolute', bottom: '80px', paddingBottom: 'var(--ion-safe-area-bottom, 0px)' }}><a href="/" className="btn btn-primary">Back to home</a></div>
            <footer className="footer text-center mb-4" style={{ position: 'fixed', bottom: 'var(--ion-safe-area-bottom, 24px)' }}>© {currentYear} World Fuel Services, All rights reserved.</footer>
          </div>
        );
      }

      return (
        <div className="text-center ml-auto mr-auto mt-3 mb-3 container d-flex flex-column justify-content-between" style={{ 'max-width': '500px' }}>
          <div>
            <div style={{ 'font-size': '8rem' }}>Oops!</div>
            <h3 className="text-uppercase">Something unexpected happened</h3>
            <p className="p-3 m-3">
              We apologize for any inconvenience, but an unexpected error has occurred.
              Detailed information about this error has automatically been recorded
              and we have been notified.
            </p>
            <div><a href="/" className="btn btn-primary">Back to home</a></div>
          </div>
          <footer className="footer text-center mb-4">© {currentYear} PayClearly</footer>
        </div>
      );
    }
    return this.props.children;
  }
}

export default components_errorboundary;


