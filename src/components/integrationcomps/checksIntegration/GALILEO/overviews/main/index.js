import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({

  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({

  });
};

const mapResourcesToProps = (state, props) => {
  return ({

  });
};

class components_integrationcomps_checksIntegration_GALILEO_overviews_main extends Component {
  render() {
    return (
      <Components.integrationcomps.checksIntegration.GALILEO.overviews.account />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_checksIntegration_GALILEO_overviews_main);


