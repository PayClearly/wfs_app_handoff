import { connect, Component } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

class components_badges_fundingtransferstatus extends Component {
  render() {
    const { status } = this.props;
    return (<span className={`badge rounded-pill bg-${_badgeType(status)}`}>{_formatStatus(status || '')}</span>);
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_fundingtransferstatus);

// Internal Helper Functions ...
function _badgeType(status) {
  // switch (status) {
  //   case 'processed':
  //     return 'primary';

  //   case 'cancelled':
  //   case 'failed':
  //     return 'danger';

  //   case 'reclaimed':
  //   case 'complete':
  //     return 'success';

  //   case 'pending':
  //   default:
  //     return 'secondary';
  // }
  if (status === 'complete') {
    return 'success';
  }
  return 'secondary';
}

function _formatStatus(status) {
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}
