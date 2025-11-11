import { connect, Component } from 'component';
import { CSSTransition } from 'react-transition-group';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
    orgId: state.organization.data.id,
    featureFlags: Selectors.featureFlags(state),
    isLoggingOut: state.router.route.params.state,
    env: _try(() => ((window.GLOBALCERT.projectId === 'payclearly-test' || window.GLOBALCERT.projectId === 'payclearly-staging') && 'DEV') || 'PROD'),
    access: state.user.access,
    userRoles: state.user.roles.data.item,
    userRolesStatus: state.user.roles.status,
  });

const mapDispatchToProps = (dispatch) => ({
    logout: (appName) => {
      dispatch(Store.user.oAuthLogout(appName));
    },
    navigate: (name, params = {}) => {
      dispatch(Store.router.navigateTo(name, params));
    },
  });

class componentsWfcomponentsMainlayout extends Component {

  state = {
    showrightnav: false,
    showprofilenav: false,
  };

  componentDidMount() {}

  componentWillUnmount() {}

  render() {

    return (
      <div className={'components_mainlayout h-100'}>
        <Components.header
          onMenuClick={() => this.setState({ showrightnav: true })}
          onProfileClick={() => this.setState((prevState) => ({ showprofilenav: !prevState.showprofilenav }))}
        />

        <CSSTransition
          classNames="main-layout-leftnav-transitioner"
          timeout={800}
          in={this.state.showrightnav}
        >
          <Components.mainverticalnav
            navigating={() => { this.setState({ showrightnav: false, showprofilenav: false }); }}
          />
        </CSSTransition>

        <CSSTransition
          classNames="main-layout-overlay-transitioner"
          in={this.state.showrightnav || this.state.showprofilenav}
          role="button"
          tabIndex="0"
          timeout={600}
          onClick={() => { this.setState({ showrightnav: false, showprofilenav: false }); }}
        >
          <div />
        </CSSTransition>

        <CSSTransition
          classNames="main-layout-subnav-popover-transitioner"
          timeout={800}
          in={this.state.showprofilenav}
        >
          <div className="main-layout-subnav-popover table">
            <table className="full-color-table full-signout-table">
              <tbody>
                <tr onClick={() => { this.setState({ showrightnav: false, showprofilenav: false }); this.props.logout(`wfs${this.props.env}`); }}>
                  <td>
                    <span className="mdi mdi-power" />
                    Sign Out
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CSSTransition>

        <div className="main-layout-container h-100">
          <Components.notificationbar />
          {Object.keys(this.props.userRoles).length !== 0 && this.props.children}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsWfcomponentsMainlayout);


