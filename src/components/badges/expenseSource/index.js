import { connect, Component } from 'component';
import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_badges_expenseSource extends Component {
  render() {
    return (this.props.source === 'manual'
      ? <span className="badge rounded-pill bg-secondary">MANUAL</span>
      : <span className="badge rounded-pill bg-primary">CARD</span>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_expenseSource);
