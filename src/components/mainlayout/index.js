import { connect, Component } from 'component';
import { CSSTransition } from 'react-transition-group';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    orgId: state.organization.data.id,
    featureFlags: Selectors.featureFlags(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    logout: () => {
      dispatch(Store.user.logout());
    },
    navigate: (name, params = {}) => {
      dispatch(Store.router.navigateTo(name, params));
    },
  });
};

class components_mainlayout extends Component {

  state = {
    showrightnav: false,
    showprofilenav: false,
  }

  componentDidMount() {
  }
  componentWillUnmount() {}

  render() {
    return (
      <div className="components_mainlayout">

        <Components.header
          onMenuClick={() => this.setState({ showrightnav: true })}
          onProfileClick={() => this.setState(prevState => ({ showprofilenav: !prevState.showprofilenav }))}
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
                <tr onClick={() => { this.setState({ showrightnav: false, showprofilenav: false }); this.props.logout(); }} >
                  <td> <span className="mdi mdi-power" /> Sign Out </td>
                </tr>
                <tr onClick={() => { this.setState({ showrightnav: false, showprofilenav: false }); this.props.navigate('profile'); }} >
                  <td> <span className="mdi mdi-account" /> Profile </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CSSTransition>

        <div className="main-layout-container h-100">
          <Components.notificationbar />
          {this.props.children}
        </div>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_mainlayout);

