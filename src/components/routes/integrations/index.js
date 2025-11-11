import { connect, Component, bindActionCreators, Fragment } from 'component';

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    policies: Selectors.entity('globalVendors_*')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_routes_integrations extends Component {




  render() {
    const { policies } = this.props;

    if (!policies.canRead) return <Components.invalidpermissions />;

    return (
      <Components.cards.integrationOverviewContainer />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_integrations);


