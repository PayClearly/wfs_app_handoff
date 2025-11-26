import { connect, Component } from 'component';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  isAdmin: state.router.route.params.admin,
  token: state.router.route.params.code,
  runningLocally: state.router.local,
  redirectToLocal: _try(() => JSON.parse(atob(state.router.route.params.state)).redirectToLocal, false),
  access: state.user.access,
  accessError: (state.user.access.status.updatingError && (state.user.access.status.updatingError.message || state.user.access.status.updatingError)) || false,
  logo: state.appConfig.data.logo,
  env: _try(() => (window.GLOBALCERT.projectId === 'TEST-ENV_CHANGE-ME' || window.GLOBALCERT.projectId === 'STAGING-ENV_CHANGE-ME') && 'DEV' || 'PROD'),
});

const mapDispatchToProps = (dispatch) => ({
  goToLogin: (redirectToLocal, env) => {
    dispatch(Store.user.oAuthAuthorization(`wfs${env}`, (url) => dispatch(Store.router.exitTo(url))));
  },
  login: (token, redirectToLocal, env) => {
    dispatch(Store.user.oAuthLogin(`wfs${env}`));
  },
  logoutUser: (env) => {
    dispatch(Store.user.oAuthLogout(`wfs${env}`));
  },
});

class componentsWfcomponentsLogin extends Component {

  componentDidMount() {
    const {
      token,
      isAdmin,
      runningLocally,
      env,
    } = this.props;

    if (!isAdmin && token) { this.props.login(token, runningLocally, env); }
    if (!isAdmin && !token) { this.props.goToLogin(runningLocally, env); }
  }

  render() {
    const { accessError, isAdmin } = this.props;

    return (
      <div className="components_wfcomponents_login h-100">
        {
          (isAdmin && <Components.login />)
          || (
            <div className="loginDiv h-100 w-100 text-center waves-effect">
              <img height="130" src={this.props.logo} alt="loading logo" />
              {
                accessError
                && (
                  <>
                    {
                      (accessError === 'Access denied'
                        && (
                          <>
                            <p style={{ paddingTop: '15px' }}>Access Denied</p>
                            <p style={{ paddingTop: '15px', paddingBottom: '15px' }}>
                              Your account does not have the required permission for this application.
                            </p>
                          </>
                        ))
                      || (
                        <p style={{ paddingTop: '15px' }}>Something Unexpected Occurred</p>
                      )
                    }
                    <p style={{ paddingBottom: '15px' }}>
                      Please try again or if you need additional assistance, please call 1+888-939-4852.
                    </p>
                    <Components.button
                      onClick={() => { this.props.logoutUser(this.props.env); }}
                      buttonText="Return to Sign in"
                    />
                  </>
                )
              }
            </div>
          )
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsWfcomponentsLogin);

