import { connect, Component } from 'component';
import Utils from 'utils';

import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_badges_status extends Component {
  render() {
    if (typeof this.props.data === 'boolean') {
      return this.props.data
        ? <span className="badge rounded-pill bg-primary">Active</span>
        : <span className="badge rounded-pill bg-danger">Inactive</span>;
    }
    return _try(() => this.props.data.toLowerCase()) === 'active'
      ? <span className="badge rounded-pill bg-primary">{Utils.capitalize(this.props.data)}</span>
      : (
        <span className={`badge rounded-pill bg-${this.props.color || 'secondary'}`}>
          {Utils.capitalize(this.props.data)}
        </span>
      );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_status);
