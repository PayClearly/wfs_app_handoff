import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    canUpdateStatus: Selectors.privileges(state).canUpdateStatus,
    cloudFunctionStatus: state.cloudFunctionStatus,
    integrations: Selectors.integrations(state),
    access: state.user.access,
    achTransfersStatus: state.account.achTransfers.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openLoginModal: (data) => {
      dispatch(Store.router.openModal('Components.modals.logbackin', data));
    },
    openACHSetupModal: () => {
      dispatch(Store.router.openModal('Components.modals.achSetup', {}));
    },
    createAchTransfer: (data) => {
      return dispatch(Store.account.createAchTransfer(data));
    },
  });
};

class components_notificationbar extends Component {

  state = {
    isDismissed: false,
  };




  handleDismiss = () => {
    this.setState({
      isDismissed: true,
    });
  };

  logBackIn = () => {
    this.props.openLoginModal();
  }

  render() {
    if (this.state.isDismissed) return null;

    if (this.props.cloudFunctionStatus.data.item.api === 'offline') {
      return (
        <div className="components_notificationbar alert alert-danger m-2 text-align-center" role="alert">
          <span className="mdi mdi-close" onClick={() => this.handleDismiss()}>
            We are currently experiencing system wide outages. All services are currently offline.
          </span>
        </div>
      );
    }

    if (this.props.cloudFunctionStatus.data.item.api === 'degraded') {
      return (
        <div className="components_notificationbar alert alert-warning m-2" role="alert">
          <span className="mdi mdi-close" onClick={() => { }}>
            We are performing scheduled maintenace. Some features will temporarily be degraded.
          </span>
        </div>
      );
    }

    return null;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_notificationbar);


