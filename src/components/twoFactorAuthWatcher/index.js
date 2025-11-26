import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';

const mapStateToProps = (state, props) => {
  return ({
    twoFactorAuthVerified: state.user.privateMetadata.data.item.twoFactorAuthVerified,
    isCsr: Selectors.entity('globalVendors_*')(state).canRead,
    modalOpen: state.router.modals.length,
    modals: state.router.modals,
    loggedIn: state.user.access.data.isLoggedIn,
    termsAccepted: Selectors.termsAccepted(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openTwoFactorAuthSetupModal: () => {
      dispatch(Store.router.openModal('Components.modals.twofactorauthsetup', { required: true, decline: () => { dispatch(Store.user.logout()); dispatch(Store.router.closeModal()); } }));
    },
    logout: () => {
      dispatch(Store.user.logout());
    },
  });
};

class components_twoFactorAuthWatcher extends Component {

  state = {
    opened: false,
  };

  componentWillReceiveProps(nextProps) {
    const projectDbContext = window.GLOBALCERT;
    const isProd = !projectDbContext.storageBucket.includes('staging') && !projectDbContext.storageBucket.includes('test');

    if (!isProd) return;

    if (this.props.termsAccepted && !this.state.opened && nextProps.loggedIn && this.props.isCsr && nextProps.isCsr && !this.props.modalOpen && !this.props.twoFactorAuthVerified && !nextProps.twoFactorAuthVerified) {
      this.props.openTwoFactorAuthSetupModal();
      this.setState({ opened: true });
    }
  }
  componentDidUpdate(prevProps) {
    const projectDbContext = window.GLOBALCERT;
    const isProd = !projectDbContext.storageBucket.includes('staging') && !projectDbContext.storageBucket.includes('test');

    if (!isProd) return;
    if (this.props.isCsr && prevProps.modalOpen && prevProps.modals.includes(modal => modal.name === 'Components.modals.twofactorauthsetup') && !this.props.modalOpen && !this.props.privateMetadata.twoFactorAuthVerified) {
      this.props.logout();
    }
  }

  render() {
    return (
      <div className="components_twoFactorAuthWatcher" />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_twoFactorAuthWatcher);

