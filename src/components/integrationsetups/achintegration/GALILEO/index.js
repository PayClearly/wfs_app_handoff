import {
  connect, Component, Fragment,
} from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state) => ({
  cardsIntegration: Selectors.integrations(state).cardsIntegration,
  achIntegration: Selectors.integrations(state).achIntegration,
  context: Selectors.context(state),
  providerTheme: Selectors.providerTheme(state),
});

const mapDispatchToProps = (dispatch) => ({
  link: () => {
    dispatch(Store.account.linkIntegration('achIntegration', { provider: 'GALILEO' }));
  },
});

const mapResourcesToProps = () => ({});

class components_integrationsetups_achintegration_GALILEO extends Component {

  state = {};

  componentDidMount() { }

  componentWillUnmount() { }

  render() {
    const cardsIntegrationDetails = _try(() => this.props.cardsIntegration.details, {});
    const cardsIntegrationStatus = _try(() => this.props.cardsIntegration.status, {});
    const achIntegrationStatus = _try(() => this.props.achIntegration.status, {});

    if (!cardsIntegrationStatus.fetched && !achIntegrationStatus.fetched) { return null; }

    let modalBody;

    if (cardsIntegrationDetails.provider !== 'GALILEO' || cardsIntegrationDetails.requiresSetup) {
      modalBody = (
        <p>You must be linked with Galileo for Cards Integration prior to setting up Galileo ACH.</p>
      );
    } else {
      modalBody = (
        <Fragment>
          <p>By setting up an account with Galileo you will be able to pay vendors using ACH.
            If you are unsure what this means or would like more information
            please contact {this.props.providerTheme.displayName} Support at {this.props.providerTheme.supportEmail}
          </p>
          <a
            tabIndex="-1"
            role="button"
            className="btn btn-primary me-1 ms-1"
            style={{ cursor: 'pointer' }}
            onClick={() => this.props.link()}
          >
            <i className="mdi mdi-link pe-1" />
            Click to Link
          </a>
        </Fragment>
      );
    }

    return (
      <div className="components_integrationsetups_achintegration_GALILEO card-body">
        {modalBody}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mapResourcesToProps
)(components_integrationsetups_achintegration_GALILEO);


