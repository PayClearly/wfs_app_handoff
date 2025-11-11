import { connect, Component } from 'component';

// Third Party Imports ...


import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// Internal Helper Functions ...
function _badgeType(status) {
  if (status === 'processed') {
    return 'primary';
  } if (status === 'cancelled') {
    return 'danger';
  }
  return 'secondary';
}

function _formatStatus(status) {
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}

class components_badges_paymentCardChangeRequestStatus extends Component {
  render() {
    const { status } = this.props;
    return (
      <span className={`components_badges_paymentCardChangeRequestStatus badge rounded-pill bg-${_badgeType(status)}`}>
        {_formatStatus(status)}
      </span>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_paymentCardChangeRequestStatus);
