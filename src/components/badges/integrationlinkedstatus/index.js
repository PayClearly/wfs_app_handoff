import { connect, Component } from 'component';
import './index.scss';

// Internal Helper Functions ...
function _badgeColor(data) {
  if (Object.keys(data).length) {
    return 'primary';
  }
  return 'secondary';
}
const mapStateToProps = (state, props) => ({
  details: _try(() => state.account[props.integration].data.details, {}),
});

const mapDispatchToProps = () => ({});

class components_badges_integrationlinkedstatus extends Component {
  render() {
    const { details } = this.props;
    return (
      <div className="components_badges_integrationlinkedstatus">
        <span
          style={{ fontSize: '85%', paddingLeft: '.6rem', paddingRight: '.6rem' }}
          className={`badge rounded-pill bg-${_badgeColor(details)}`}
        >
          {Object.keys(details).length ? 'Linked' : 'Unlinked'}
        </span>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_integrationlinkedstatus);
