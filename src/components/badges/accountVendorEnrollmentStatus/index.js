import { connect, Component } from 'component';
import Utils from 'utils';

import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_badges_accountVendorEnrollmentStatus extends Component {
  render() {
    let badgeColor;
    let { status } = this.props;
    switch (this.props.status) {
      case 'inProgress':
      case 'In Progress':
        badgeColor = 'success';
        status = 'in Progress';
        break;
      case 'attention':
      case 'Attention':
        badgeColor = 'danger';
        break;
      case 'enrolled':
      case 'Enrolled':
        badgeColor = 'primary';
        break;
      case 'pending':
      case 'Pending':
      case 'declined':
      case 'Declined':
      default:
        badgeColor = 'secondary';
        break;
    }
    return (
      <span className={`components_badges_accountVendorEnrollmentStatus badge rounded-pill bg-${badgeColor}`}>
        {Utils.capitalize(status)}
      </span>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_accountVendorEnrollmentStatus);
