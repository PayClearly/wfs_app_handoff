import { connect, Component } from 'component';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
import logo from 'assets/logos/logo.png';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    access: state.user.access,
    routeParams: state.router.route.params,
    logo: state.appConfig.data.logo,
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    confirmEmail: (firstName, lastName, password) => {
      dispatch(Store.user.confirmEmail(firstName, lastName, password));
    },
    leave: () => {
      dispatch(Store.router.navigateTo('dashboard', {}));
    },
    tandc: () => {
      dispatch(Store.router.exitTo('dashboard', {}));
    },
  });
};

class components_routes_confirmemail extends Component {

  state = {
    submitEnabled: false,
    showOverlay: true,
  };

  componentDidMount() {
    // parse out the name
    const fullName = this.props.routeParams.name && atob(this.props.routeParams.name) || '';
    const firstName = fullName.split(' ')[0] || '';
    const lastName = fullName.split(' ')[1] || '';

    this.setState({
      showOverlay: false,
      token: this.props.routeParams.token,
      uid: this.props.routeParams.uid,
      email: atob(this.props.routeParams.email),
      firstName,
      lastName,
    });

    if (!this.props.routeParams.token || !this.props.routeParams.uid || !this.props.routeParams.email) {
      this.props.leave();
    }
  }
  componentWillReceiveProps(nextProps) {
    const form = (nextProps.forms['Components.forms.welcome'] && nextProps.forms['Components.forms.welcome'].default) || {};
    const submitEnabled = !nextProps.access.status.updating;

    this.setState({
      formValid: form._allValid,
      submitEnabled,
    });
  }
  componentWillUnmount() {}

  submitClicked = () => {
    if (!this.state.formValid || !this.state.submitEnabled) return;

    const form = this.props.forms['Components.forms.welcome'].default;
    this.props.confirmEmail({
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      password: form.password.value,
      token: this.state.token,
      uid: this.state.uid,
      email: this.state.email,
    });
  };

  render() {
    const currentLogo = this.props.logo || logo;
    return (
      <div className="components_routes_confirmemail h-100 w-100">

        <CSSTransition
          classNames="confirm-email-transitioner"
          timeout={600}
          in={!this.state.showOverlay}
        >
          <div className="h-100 w-100 container flex-center">
            <div style={{ top: '-5%' }} className={classNames('confirmuser-card', 'mx-auto', 'align-self-center')}>

              <div className={classNames('text-center', 'pb-5')}>
                <img alt="logo" src={currentLogo} height="75px" />
              </div>

              <p className="pb-3"> Welcome to {this.props.providerTheme.displayName}, please enter your name and password </p>

              {!this.state.showOverlay && (
                <Components.forms.welcome disabled={!this.state.submitEnabled} initialFormData={{ firstName: this.state.firstName, lastName: this.state.lastName }} />
              )}

              { this.props.access.status.updatingError && (
                <div className={classNames('alert', 'alert-danger')} role="alert">
                  Token Is Expired!
                </div>
              )}

              <div className={classNames('lb-body', 'pt-3')}>

                <button
                  className={classNames('btn', 'btn-primary', 'btn-lg', 'waves-effect', 'z-depth-5dp', { disabled: !this.state.formValid || !this.state.submitEnabled })}
                  onClick={this.submitClicked}
                  type="submit"
                >
                  { !this.state.submitEnabled ? (
                    <Components.loading />
                  ) : (
                    <div> Confirm Account </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_confirmemail);
