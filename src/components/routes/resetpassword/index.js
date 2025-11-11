import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import classNames from 'classnames';
import { CSSTransition } from 'react-transition-group';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import logo from 'assets/logos/logo.png';
import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    access: state.user.access,
    routeParams: state.router.route.params,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    resetPassword: (data) => {
      dispatch(Store.user.resetPassword(data));
    },
    leave: () => {
      dispatch(Store.router.navigateTo('dashboard', {}));
    },
    tandc: () => {
      dispatch(Store.router.exitTo('dashboard', {}));
    },
  });
};

class components_routes_resetpassword extends Component {

  state = {
    submitEnabled: false,
    showOverlay: true,
  };

  componentDidMount() {
    this.setState({
      showOverlay: false,
      token: this.props.routeParams.token,
      uid: this.props.routeParams.uid,
    });

    if (!this.props.routeParams.token || !this.props.routeParams.uid) {
      this.props.leave();
    }
  }

  componentWillReceiveProps(nextProps) {
    const form = (nextProps.forms['Components.forms.resetpassword'] && nextProps.forms['Components.forms.resetpassword'].default) || {};
    const submitEnabled = !nextProps.access.status.updating;

    this.setState({
      formValid: form._allValid,
      submitEnabled,
    });

  }

  submitClicked = () => {
    if (!this.state.formValid || !this.state.submitEnabled) return;

    const form = this.props.forms['Components.forms.resetpassword'].default;
    this.props.resetPassword({
      password: form.password.value,
      token: this.state.token,
      uid: this.state.uid,
    });
  };

  render() {
    return (
      <div className="components_routes_resetpassword h-100 w-100">

        <CSSTransition
          classNames="reset-password-transitioner"
          active={!this.state.showOverlay}
        >
          <div className="h-100 w-100 container flex-center">

            <div style={{ top: '-5%', width: '300px' }} className={classNames('confirmuser-card', 'mx-auto', 'align-self-center')}>

              <div className={classNames('text-center', 'pb-5')}>
                <img alt="logo" src={logo} height="75px" />
              </div>

              <p className="pb-3">Please enter a new password. Your new password must have capital and lowercased letters and be at least 8 characters</p>

              <Components.forms.resetpassword disabled={!this.state.submitEnabled} />

              {this.props.access.status.updatingError &&
                <div className={classNames('alert', 'alert-danger')} role="alert">
                  {this.props.access.status.updatingError}
                </div>
              }

              <div className={classNames('lb-body', 'pt-3')}>

                <button
                  className={classNames('btn', 'btn-primary', 'btn-lg', 'waves-effect', 'z-depth-5dp', { disabled: !this.state.formValid || !this.state.submitEnabled })}
                  type="submit"
                  onClick={this.submitClicked}
                >
                  {!this.state.submitEnabled ? (
                    <Components.loading />
                  ) : (
                    <div> Reset Password </div>
                  )}
                </button>
              </div>
            </div>
          </div>

        </CSSTransition>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_resetpassword);


