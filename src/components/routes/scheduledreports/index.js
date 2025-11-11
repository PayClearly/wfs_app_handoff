import { connect, Component } from 'component';
import Components from 'components';

import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

class components_routes_scheduledreports extends Component {
  render() {
    return (
      <Components.cards.reporttemplates />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_scheduledreports);
