import { connect, Component } from 'component';

import Components from 'components';
import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// Internal Helper Functions ...
function _batchType(data) {
  const status = data.primary;
  if (data.classOverride) {
    return data.classOverride;
  }
  if (status === 'Complete') {
    return 'primary';
  }
  return 'secondary';
}

// eslint-disable-next-line camelcase
class components_badges_pipelinestatus extends Component {
  render() {
    const { primary = '', sub = false } = this.props.data;

    return (
      <span className="text-primary">
        <Components.tooltip className="float-start pe-2">
          <div>
            <span style={{ fontSize: '85%' }} className={`badge rounded-pill bg-${_batchType(this.props.data)}`}>
              {primary}
            </span>
          </div>
          <div>{sub || primary}</div>
        </Components.tooltip>
      </span>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_pipelinestatus);
