import { connect, Component } from 'component';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_badges_expenseReportStatus extends Component {
  render() {
    let badgeColor;
    switch (this.props.status) {
      case 'open':
        badgeColor = 'secondary';
        break;
      case 'approved':
        badgeColor = 'success';
        break;
      case 'rejected':
        badgeColor = 'danger';
        break;
      case 'submitted':
        badgeColor = 'secondary';
        break;
      case 'reimbursed':
      default:
        badgeColor = 'primary';
        break;
    }
    return (
      <span className={`components_badges_expenseReportStatus badge rounded-pill bg-${badgeColor}`}>
        {this.props.status.toUpperCase()}
      </span>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_expenseReportStatus);
