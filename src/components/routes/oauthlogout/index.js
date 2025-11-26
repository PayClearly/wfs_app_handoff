import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    organizationId: state.organization.data.id,
    accountId: state.account.data.id,
    access: state.user.access,
    appName: state.appConfig.data.metadata.name,
    appLogo: state.appConfig.data.logo,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    navigate: (to) => {
      dispatch(Store.router.navigateTo(to));
    },
    logout: () => {
      dispatch(Store.user.oAuthLogout(props.appName, true));
    },
  });
};

class components_routes_oauthlogout extends Component {

  componentDidMount() {
    if (this.props.access.data.isLoggedIn) this.props.logout();
    return this.props.navigate('dashboard');
  }
  componentWillReceiveProps(nextProps) {
  }

  render() {
    const currentYear = (new Date()).getFullYear();
    return (
      <div className="text-center ml-auto mr-auto mt-3 mb-3 container d-flex flex-column justify-content-between">
        <div>
          <div style={{ 'font-size': '10rem' }} />
          <h1 className="text-uppercase">Processing logout...</h1>
          <Components.horizontalLoader />
        </div>
        <footer className="footer text-center mb-4">© {currentYear} CHANGE_ME_COMPANY_NAME</footer>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_oauthlogout);

