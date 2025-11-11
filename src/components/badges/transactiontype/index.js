import { connect, Component } from 'component';

import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

class components_badges_transactiontype extends Component {
  render() {
    const { type } = this.props;

    switch (type) {
      case 'authorizations':
        return <span className="badge rounded-pill bg-secondary text-uppercase">Authorized</span>;
      case 'declined':
        return <span className="badge rounded-pill bg-danger text-uppercase">Declined</span>;
      case 'cleared':
        return <span className="badge rounded-pill bg-success text-uppercase">Cleared</span>;
      default:
        return <span className="badge rounded-pill bg-secondary text-uppercase">{type}</span>;
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_transactiontype);
