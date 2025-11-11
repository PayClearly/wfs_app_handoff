import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    link: () => {
      dispatch(Store.account.linkIntegration('fundingIntegration', { provider: 'STUB' }));
    },
  });
};

class components_integrationsetups_fundingintegration_STUB extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <div className="components_integrationsetups_fundingintegration_STUB">
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

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationsetups_fundingintegration_STUB);


