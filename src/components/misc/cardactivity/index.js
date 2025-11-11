import { connect, Component } from 'component';
import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_misc_cardactivity extends Component {
  render() {
    const data = this.props.data || {};
    return (
      <div className="components_misc_cardactivity">
        {data.authorizationCount && (
          <span className="badge rounded-pill bg-primary">{data.authorizationCount}</span> || <span />
        )}
        {(data.clearedCount && <span className="badge rounded-pill bg-success">{data.clearedCount}</span>) || <span />}
        {(data.declinedCount && <span className="badge rounded-pill bg-danger">{data.declinedCount}</span>) || <span />}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_misc_cardactivity);
