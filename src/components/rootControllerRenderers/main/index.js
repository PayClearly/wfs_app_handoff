import { connect, Component, Fragment } from 'component';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  access: state.user.access,
  baseStyles: _try(() => state.appConfig.data.styles.light, {}),
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_rootControllerRenderers_main extends Component {
  state = {};

  componentDidMount() {
    const root = document.documentElement;

    Object.keys(this.props.baseStyles).forEach((style) => {
      root.style.setProperty(style, this.props.baseStyles[style]);
    });
  }

  render() {
    return (
      <Fragment>
        <div className="h-100">
          {(this.props.access.data.isGuest || this.props.access.data.isLoggedIn)
            && <Components.routes.routeWrapper access={this.props.access.data} layout={this.props.layout} login={this.props.login} noAuthRoutes={this.props.noAuthRoutes} />}
        </div>

        <Components.modals.modalWrapper />

        <Components.toasts.toastWrapper />

        <Components.userswatcher />

        <Components.twoFactorAuthWatcher />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_rootControllerRenderers_main);


