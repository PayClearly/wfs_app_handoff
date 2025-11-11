import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  checksIntegration: _try(() => Selectors.integrations(state).checksIntegration, {}),
});

const mapDispatchToProps = (dispatch, props) => {
  return ({

  });
};

const mapResourcesToProps = (state, props) => {
  return ({

  });
};

class components_integrationcomps_achintegration_GALILEO_overviews_main extends Component {
  render() {
    return (
      <Components.integrationcomps.achintegration.GALILEO.overviews.account />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_achintegration_GALILEO_overviews_main);


