import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    issues: _try(() => state.account[props.integration].data.currentIssues, {}),
    metas: _try(() => state.account[props.integration].data.metas, {}),
    status: _try(() => state.account[props.integration].status, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    getIssues: (integration) => {
      dispatch(Store.account.getIntegrationIssues({ integrationType: integration, issueType: props.issueType }));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_containers_integrationIssuesWrapper extends Component {

  componentDidMount() {
    this.props.getIssues(this.props.integration);
  }
  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.metas || {}) !== JSON.stringify(this.props.metas || {})) {
      this.props.getIssues(this.props.integration);
    }
  }
  componentWillUnmount() { }

  render() {
    return (
      <div className="components_containers_integrationIssuesWrapper">
        <Components.tables.integrationIssues integration={this.props.integration} data={Object.values(this.props.issues || {})} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_containers_integrationIssuesWrapper);


