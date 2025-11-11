import { connect, Component, bindActionCreators, Fragment } from 'component';
import firebase from 'firebase';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    uid: state.user.access.data.uid,
    users: state.users.data.items,
    access: state.user.access,
    currentTransferPool: Selectors.funding(state).currentTransferPool,
    profile: state.user.profile.data.item,
    orgId: state.organization.data.id,
    organizations: state.organizations.data.items,
    logo: state.appConfig.data.logo,
    darkLogo: state.appConfig.data.darkLogo,
    darkModeEnabled: state.appConfig.data.darkModeEnabled,
    providerDisplayName: Selectors.providerTheme(state).displayName,
    darkMode: state.user.preferences.data.item.darkMode,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    setDarkModePreference: (data) => {
      dispatch(Store.user.updatePreferences({ darkMode: data }));
    },
  });
};

class components_header extends Component {

  componentDidMount() {
    return firebase.auth().currentUser.getIdToken().then((token) => {
      this.setState({
        token,
      });
    });
  }
  componentWillUnmount() { }

  render() {
    const { darkMode } = this.props;
    const user = (this.props.users && this.props.users[this.props.uid]) || this.props.profile;
    const org = this.props.organizations && this.props.organizations[this.props.orgId];

    let path;
    let defaultLogo;
    if (darkMode) {
      defaultLogo = this.props.darkLogo;
      if (org && this.props.organizations[this.props.orgId].darkLogo) {
        path = this.props.organizations[this.props.orgId].darkLogo.storagePath;
      }
    } else {
      defaultLogo = this.props.logo;
      if (org && this.props.organizations[this.props.orgId].logo) {
        path = this.props.organizations[this.props.orgId].logo.storagePath;
      }
    }

    return (
      <header className="main-header components_header">
        <div className="main-header-logo-container">
          <Components.permissionedImage className="main-header-logo" default={defaultLogo} path={path} />
        </div>
        <div className="topbar">
          <div className="main-header-left-icons-container">
            <div
              className="main-header-icon desktop-hidden"
              role="menuitem"
              tabIndex="0"
              onClick={() => { this.props.onMenuClick(); }}
            >
              <i style={{ fontSize: '34px' }} className="mdi mdi-menu" />
            </div>
          </div>
          {this.props.darkModeEnabled ?
            <div className={'dark-mode-toggle custom-switch custom-switch mb-4'}>
              <input
                type="checkbox"
                role="button"
                tabIndex="-1"
                className={'custom-switch-input'}
                id={'dark-mode-switch'}
                onChange={(e) => {
                  this.props.setDarkModePreference(e.target.checked);
                }}
                value={darkMode}
                checked={darkMode}
              />
              <label className="custom-switch-btn" htmlFor="dark-mode-switch" />
              <span className={`${darkMode ? 'dark' : ''}`}>Dark Mode</span>
            </div>
            : null
          }
          <div className="main-header-right-icons-container">
            {_try(() => this.props.currentTransferPool) > 0 && <Components.transferPoolMenuItem />}
            <div
              className="name-menu"
              role="menuitem"
              tabIndex="0"
              onClick={() => { this.props.onProfileClick(); }}
            >
              <span className={`display-name pe-1${user ? '' : ' blurred'}`}>
                {user ? Utils.getDisplayName(user) : `Guest ${this.props.providerDisplayName}`}
              </span>
              <Components.avatar
                user={user}
                width={46}
              />
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_header);


