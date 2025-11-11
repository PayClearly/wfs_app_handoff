import { connect, Component } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  forms: state.forms,
  privateMetadata: state.user.privateMetadata.data.item,
  twoFactorAuthStatus: state.user.twoFactorAuth.status,
});

const mapDispatchToProps = (dispatch) => ({
  enrollTwoFactorAuth: (data) => dispatch(Store.user.enrollTwoFactorAuth(data)),
  verifyTwoFactorAuthToken: (data) => dispatch(Store.user.verifyTwoFactorAuthToken(data)),
  cancelSetup: () => dispatch(Store.user.cancelSetup()),
  clearErrors: () => dispatch(Store.user.clearErrors('twoFactorAuth')),
});

// eslint-disable-next-line camelcase
class components_modals_twofactorauthsetup extends Component {

  state = {
    forms: {},
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      forms: nextProps.forms,
    });
    if (!this.props.privateMetadata.twoFactorAuthVerified && nextProps.privateMetadata.twoFactorAuthVerified) {
      this.props.close();
    }
  }

  componentWillUnmount() {
    this.props.clearErrors();
  }

  handleNext = (step) => {
    if (step === 1) {
      this.props.enrollTwoFactorAuth(this.props.forms['Components.forms.enrolltwofactorauth'].default._values);
    }

    if (step === 2) {
      this.props.verifyTwoFactorAuthToken(this.props.forms['Components.forms.verifytwofactordevice'].default._values);
    }
  };

  handleClose = () => {
    this.props.cancelSetup();
    this.props.close();
    if (this.props.decline) { this.props.decline(); }
  };

  render() {
    let step = 1;
    let form = this.state.forms['Components.forms.enrolltwofactorauth']
      && this.state.forms['Components.forms.enrolltwofactorauth'].default;

    if (this.props.privateMetadata.twoFactorAuthType) {
      step = 2;
      form = this.state.forms['Components.forms.verifytwofactordevice']
        && this.state.forms['Components.forms.verifytwofactordevice'].default;
    }

    const updating = this.props.twoFactorAuthStatus.creating || this.props.twoFactorAuthStatus.updating;

    return (
      <div className="modal-dialog components_modals_twofactorauthsetup" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title" id="exampleModalLabel">Two Factor Authentication Setup</h2>
            <button onClick={this.handleClose} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body px-3">
            <div className="col-md">
              <Components.cards.wizard>
                <Components.step
                  first
                  description={'Select Method'}
                  label={'step 1'}
                  done={step > 1}
                  current={step === 1}
                  disabled={step < 1}
                >
                  <Components.forms.enrolltwofactorauth />
                </Components.step>
                <Components.step
                  description={'Verify Device'}
                  label={'step 2'}
                  done={step > 2}
                  current={step === 2}
                  disabled={step < 2}
                  last
                >
                  <Components.containers.verifytwofactordevice />
                </Components.step>
              </Components.cards.wizard>
            </div>
            <div className="modal-footer mt-4">
              <div className="row float-end">
                <Components.button
                  buttonText={'Cancel Setup'}
                  onClick={this.handleClose}
                  ariaLabel="Cancel Setup"
                  className="btn btn-secondary me-4"
                  disabled={updating}
                />
                <Components.button
                  buttonText={'Next'}
                  onClick={() => this.handleNext(step)}
                  ariaLabel="Next"
                  className="btn btn-primary waves-effect z-depth-5dp float-end"
                  updating={updating}
                  disabled={!form || !form._allValid}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_twofactorauthsetup);
