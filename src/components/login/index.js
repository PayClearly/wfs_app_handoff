import { connect, Component } from 'component';
import classNames from 'classnames';
import { CSSTransition } from 'react-transition-group';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  forms: state.forms,
  access: state.user.access,
  twoFactorAuth: state.user.twoFactorAuth,
  logo: state.appConfig.data.logo,
  router: state.router,
});

const mapDispatchToProps = (dispatch, props) => ({
  login: (email, password) => {
    dispatch(Store.user.login({ email, password, provider: 'emailPass' }));
  },
  verifyTwoFactorAuthToken: (data) => dispatch(Store.user.verifyTwoFactorAuthToken(data)),
  syncAccounts: (desiredContext) => {
    if (desiredContext) {
      dispatch(Store.accounts.sync(desiredContext.orgId, desiredContext.accountId));
    } else {
      dispatch(Store.accounts.sync());
    }
  },
});

class components_login extends Component {

  state = {
    loginEnabled: false,
    showOverlay: true,
    form: {},
  };

  componentDidMount() {
    this.setState({
      showOverlay: false,
    });
  }

  componentWillReceiveProps(nextProps) {
    const form = nextProps.showTwoFactorLogin ?
      (nextProps.forms['Components.forms.verifytwofactordevice'] && nextProps.forms['Components.forms.verifytwofactordevice'].default) || {} :
      (nextProps.forms['Components.forms.login'] && nextProps.forms['Components.forms.login'].default) || {};
    const loginEnabled = form._allValid && !nextProps.access.status.updating;

    this.setState({
      loginEnabled,
      form,
    });
  }

  componentWillUnmount() {
    if (this.props.showTwoFactorLogin) {
      if (this.props.router.route.params.orgId || this.props.router.route.params.accountId) {
        this.props.syncAccounts(this.props.router.route.params);
      } else {
        this.props.syncAccounts();
      }
    }
  }

  loginClicked = () => {
    if (!this.state.loginEnabled) return;

    const { form } = this.state;
    if (this.props.showTwoFactorLogin) {
      return this.props.verifyTwoFactorAuthToken(form._values);
    }
    this.props.login(form.email.value, form.password.value);
  };

  render() {
    const { form } = this.state;
    const updating = (this.props.access.status && this.props.access.status.updating) || (this.props.twoFactorAuth.status && this.props.twoFactorAuth.status.updating);

    const disabled = !form._allValid || updating;

    return (
      <div className="h-100 w-100 components_login">

        <CSSTransition
          classNames="login-component-transitioner"
          timeout={600}
          in={!this.state.showOverlay}
        >
          <div className="h-100 w-100 container flex-center-column">
            <div style={{ top: '-5%' }} className={classNames('login-card', 'mx-auto', 'align-self-center')}>

              <div style={{ height: '90px', marginBottom: '60px' }} className={classNames('text-center')}>
                <img alt="logo" src={this.props.logo} style={{ maxWidth: '100%', maxHeight: '100%' }} />
              </div>

              {(() => {
                if (this.props.showTwoFactorLogin) {
                  return (
                    <Components.containers.verifytwofactordevice
                      // OnSubmit prop allows the user to sign in by hitting the enter key
                      onSubmit={(event) => {
                        event.preventDefault();
                        this.loginClicked();
                      }}
                    />
                  );
                }
                return (
                  <Components.forms.login
                    disabled={disabled}
                    blurAll={this.state.blurAll}
                    updating={updating}
                    // OnSubmit prop allows the user to sign in by hitting the enter key
                    onSubmit={(event) => {
                      event.preventDefault();
                      this.loginClicked();
                    }}
                  />
                );
              })()}

              {this.props.access.status.updatingError &&
                <div className={classNames('alert', 'alert-danger')} role="alert">
                  {this.props.access.status.updatingError}
                </div>
              }

              <div className={classNames('lb-body', 'pt-3')}>
                <Components.button
                  buttonText="Sign In"
                  onClick={this.loginClicked}
                  onDisabledClick={() => { this.setState({ blurAll: true }); }}
                  ariaLabel="Login"
                  className="btn btn-primary btn-lg waves-effect z-depth-5dp"
                  disabled={disabled}
                  updating={updating}
                />
                {
                  this.props.handleForgotPassword &&
                  <a className="ms-2" onClick={this.props.handleForgotPassword} href="/forgot-password">Forgot Password?</a>
                }
              </div>
            </div>
          </div>
        </CSSTransition>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_login);

