import { connect, Component } from 'component';

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  features: Selectors.featureFlags(state),
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_routes_features extends Component {
  render() {
    return (
      <div className="components_routes_features">
        <Components.entities.featureFlags />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_features);
