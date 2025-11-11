import { connect, Component } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  policies: Selectors.entity('reports_idOrganization_idAccount')(state),
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_cards_completedreports extends Component {

  state = {};

  render() {
    if (!this.props.policies.canRead) { return <Components.invalidpermissions />; }

    return (
      <Components.tables.reports />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_cards_completedreports);
