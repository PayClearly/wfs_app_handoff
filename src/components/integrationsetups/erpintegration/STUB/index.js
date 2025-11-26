import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    link: () => {
      dispatch(Store.account.linkIntegration('erpIntegration', { provider: props.provider }));
    },
  });
};

class components_integrationsetups_erpintegration_STUB extends Component {

  render() {
    return (
      <div className="components_integrationsetups_erpintegration_STUB">
        <p>The mock integration is used for testing/demoing purposes only</p>
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
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationsetups_erpintegration_STUB);

