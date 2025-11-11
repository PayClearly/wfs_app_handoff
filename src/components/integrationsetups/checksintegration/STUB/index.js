import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    setup: _try(() => Selectors.integrations(state).checksIntegration.details),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    link: (requiresSetup) => {
      dispatch(Store.account.linkIntegration('checksIntegration', { provider: 'STUB', requiresSetup }));
    },
  });
};

class components_integrationsetups_checksintegration_STUB extends Component {

  state = {
    requiresSetup: false,
  }

  componentDidMount() {
    this.setState({ requiresSetup: !!this.props.setup.requiresSetup });
  }


  render() {
    return (
      <div className="components_integrationsetups_checksintegration_STUB">
        <p>The mock integration is used for testing/demoing purposes only</p>
        <div
          tabIndex="-1"
          role="button"
          style={{ cursor: 'pointer' }}
          onClick={() => this.setState({ requiresSetup: !this.state.requiresSetup })}
        >
          <p>requires setup: {`${this.state.requiresSetup}`}</p>
        </div>
        <a
          tabIndex="-1"
          role="button"
          className="btn btn-primary me-1 ms-1"
          style={{ cursor: 'pointer' }}
          onClick={() => this.props.link(this.state.requiresSetup)}
        >
          <i className="mdi mdi-link pe-1" />
          Click to continue
        </a>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationsetups_checksintegration_STUB);


