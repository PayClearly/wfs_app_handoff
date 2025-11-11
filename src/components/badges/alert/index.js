import { connect, Component } from 'component';
import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

class components_badges_alert extends Component {
  render() {
    return (
      <div className={`components_badges_alert ${this.props.position}`}>
        {
          this.props.badges && Object.values(this.props.badges)
            .filter((badge) => badge.active)
            .map((badge, index) => (
              <span className={`badge bg-${badge.color} csr-dashboard-badge${index > 0 ? ' badge-left-margin' : ''}`}>
                {badge.value}
              </span>))
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_alert);
