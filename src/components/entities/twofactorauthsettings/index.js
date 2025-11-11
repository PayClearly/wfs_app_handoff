import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    privateMetadata: state.user.privateMetadata.data.item,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openTwoFactorAuthSetupModal: () => {
      dispatch(Store.router.openModal('Components.modals.twofactorauthsetup', {}));
    },
    removeTwoFactor: () => {
      dispatch(Store.router.openModal('Components.modals.removetwofactorauth', {}));
    },
  });
};

class components_entities_twofactorauthsettings extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <div className={'row mt-3 components_entities_twofactorauthsettings'}>
        <div className={'col'}>
          <h2 style={{ display: 'inline' }}>Two Factor Authentication</h2>
          {
            this.props.privateMetadata.twoFactorAuthVerified &&
            <span className="text-success">
              <i className="mdi mdi-check mdi-48px" />
            </span>
          }
          <p>Adds a second layer of protection to your account</p>
          {(() => {
            if (this.props.privateMetadata.twoFactorAuthVerified) {
              return (
                <button
                  role="button"
                  className="btn btn-secondary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { this.props.removeTwoFactor(); }}
                >
                  Remove Two Factor Auth
                </button>
              );
            }
            return (
              <button
                tabIndex="-1"
                role="button"
                className="btn btn-primary"
                style={{ cursor: 'pointer' }}
                onClick={() => { this.props.openTwoFactorAuthSetupModal(); }}
              >
                Add Two Factor Auth
              </button>
            );
          })()}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_twofactorauthsettings);


