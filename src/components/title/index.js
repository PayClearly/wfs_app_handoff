import { connect, Component } from 'component';

import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state) => ({
  route: state.router.route,
  routeConfig: Selectors.routeConfig(state),
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_title extends Component {

  getTitle = () => {
    const routerConfig = this.props.routeConfig || {};
    const { tab } = this.props.route.params;
    const tabs = routerConfig.tabs || [];

    if (tab && tabs.length > 0 && tabs.find((t) => t.name === tab)) {
      return tabs.find((t) => t.name === tab).label;
    }
    if (tabs.length > 0) { return tabs[0].label; }

    return routerConfig.displayName;
  };

  render() {
    return (
      <div className="components_title row mb-4 pl-md-0 context-account">
        <div className="col-md-6 col-8 align-self-center">
          <h2 className="text-primary mb-0 mt-0">{this.getTitle()}</h2>
          {!this.props.hideAccountContext && <Components.accountcontext />}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_title);
