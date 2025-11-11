import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import jwtDecode from 'jwt-decode';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    latestTermsAndConditions: state.global.latestTermsAndConditions.data.item,
    latestTermsAndConditionsStatus: state.global.latestTermsAndConditions.status,
    routeParams: state.router.route.params || {},
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    acceptTermsAndConditions: (token) => {
      dispatch(Store.global.acceptTermsAndConditions(token));
    },
    fetchLatestTermsAndConditions: (timeStamp) => {
      dispatch(Store.global.fetchLatestTermsAndConditions(timeStamp));
    },
  });
};

class components_routes_termsandconditions extends Component {

  state = {
    latestTermsAndConditionsId: null,
    accepted: false,
  };


  componentDidMount() {
    const latestTermsAndConditionsId = jwtDecode(this.props.routeParams.token).claims.latestTermsAndConditions.toString();
    this.setState({
      latestTermsAndConditionsId,
    });
    this.props.fetchLatestTermsAndConditions(latestTermsAndConditionsId);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hasAccepted) {
      this.props.close();
    }
  }

  onAccept = () => {
    this.props.acceptTermsAndConditions(this.props.routeParams.token);
    this.setState({
      accepted: true,
    });
  };

  onDecline = () => {
    if (this.props.decline && !this.state.accepting) {
      this.props.decline();
    }
    if (!this.state.accepting) {
      this.props.close();
    }
  }

  render() {
    if (this.state.accepted) {
      return (
        <div className={'p-5 h-100 text-center text align-middle align-middle'} style={{ margin: 'auto', 'max-width': '1500px' }}>
          <div className={'jumbotron'}>
            <h1>Thank you!</h1>
            <p>You are now enrolled with {this.props.providerTheme.displayName} ACH payments. If you have any questions or would like additional information, please contact {this.props.providerTheme.displayName} support at <a href={`mailto: ${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a> or {this.props.providerTheme.supportPhone} or visit our website at <a href="https://www.payclearly.com/">www.payclearly.com</a></p>
          </div>
        </div>
      );
    }

    if (this.props.latestTermsAndConditionsStatus.fetching || !this.props.latestTermsAndConditions.html) {
      return (
        <Components.spinner />
      );
    }

    return (
      <div className="components_routes_termsandconditions">
        <div className={'container'}>
          <div className="header">
            <h2 className="title">PayClearly&apos;s Terms & Conditions</h2>
          </div>
          <div className="body">
            <h5>Effective as of {new Date(this.props.latestTermsDate).toLocaleString()}</h5>
            <div dangerouslySetInnerHTML={{ __html: this.props.latestTermsAndConditions.html }} />
          </div>
          <div className="modal-footer">
            <button disabled={this.props.latestTermsAndConditionsStatus.fetching} style={{ width: '6rem' }} type="button" className="btn btn-primary" onClick={() => { return this.onAccept(); }}>{
              (this.props.latestTermsAndConditionsStatus.submitting)
                ? <Components.spinner white height={'20px'} />
                : 'Accept'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_termsandconditions);


