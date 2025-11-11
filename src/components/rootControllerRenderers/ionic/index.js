import { connect, Component } from 'component';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  router: state.router.data,
  access: state.user.access,
  deviceData: state.device.data,
  biometrics: state.device.biometrics,
  notAuthedShowing: state.router.notAuthed,
  env: _try(() => (window.GLOBALCERT.projectId === 'payclearly-test' || window.GLOBALCERT.projectId === 'payclearly-staging') && 'DEV' || 'PROD'),
});

const mapDispatchToProps = (dispatch, props) => ({
  exitTo: (to) => {
    dispatch(Store.router.exitTo(to));
  },
  closeBrowser: () => {
    dispatch(Store.device.closeBrowser());
  },
  activeCheck: (data) => {
    dispatch(Store.device.checkIsActive(data));
  },
  validateCache: (data) => {
    dispatch(Store.wfs.validateCache(data));
  },
  openNotAuthedPage: () => {
    dispatch(Store.router.openNotAuthed());
  },
  closeNotAuthedPage: () => {
    dispatch(Store.router.closeNotAuthed());
  },
  clearUser: (env) => {
    dispatch(Store.user.oAuthLogout(`wfsapp${env}${window.GLOBALCERT.WFS_TEST_ENV || ''}`, true));
  },
});

const mapResourcesToProps = (state, props) => ({});

class components_rootControllerRenderers_ionic extends Component {





  render() {
    return (
      <>
        <Components.ionic.routes.routeWrapper
          access={this.props.access.data}
          authed={this.props.biometrics.data.isAuthed}
          layout={this.props.layout}
          login={this.props.login}
          noAuthRoutes={this.props.noAuthRoutes}
        />
        <Components.ionic.modals.modalWrapper />
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_rootControllerRenderers_ionic);


