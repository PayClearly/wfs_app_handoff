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
  checksIntegration: Selectors.integrations(state).checksIntegration,
  context: Selectors.context(state),
  providerTheme: Selectors.providerTheme(state),
});

const mapDispatchToProps = (dispatch) => ({
  link: () => {
    dispatch(Store.account.linkIntegration('checksIntegration', { provider: 'GALILEO' }));
  },
});

const mapResourcesToProps = () => ({});

class components_integrationsetups_checksintegration_GALILEO extends Component {

  state = {};

  componentDidMount() { }

  componentWillUnmount() { }

  render() {
    const cardsIntegrationDetails = _try(() => this.props.cardsIntegration.details, {});
    const cardsIntegrationStatus = _try(() => this.props.cardsIntegration.status, {});
    const checksIntegrationStatus = _try(() => this.props.checksIntegration.status, {});

    if (!cardsIntegrationStatus.fetched && !checksIntegrationStatus.fetched) { return null; }

    let modalBody;

    if (cardsIntegrationDetails.provider !== 'GALILEO' || cardsIntegrationDetails.requiresSetup) {
      modalBody = (
        <p>You must be linked with Galileo for Cards Integration prior to setting up Galileo for Check payments.</p>
      );
    } else {
      modalBody = (
        <Fragment>
          <p>By setting up an account with Galileo you will be able to pay vendors using Check.
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
      <div className="components_integrationsetups_checksintegration_GALILEO card-body">
        {modalBody}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mapResourcesToProps
)(components_integrationsetups_checksintegration_GALILEO);


