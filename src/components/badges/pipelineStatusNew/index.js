import { connect, Component } from 'component';
import Components from 'components';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// Internal Helper Functions ...
function _batchType(data) {
  const { status } = data;
  if (data.statusClassOverride) {
    return data.statusClassOverride;
  }
  if (status === 'Complete') {
    return 'primary';
  }
  return 'secondary';
}

class components_badges_pipelinestatus extends Component {
  render() {
    const { status = '', substatus = false, statusClassOverride } = this.props.data;

    return (
      <span className="text-primary">
        <Components.tooltip className="float-start pe-2">
          <div>
            <span
              style={{ fontSize: '85%' }}
              className={`badge rounded-pill bg-${_batchType({ status, statusClassOverride })}`}
            >
              {status}
            </span>
          </div>
          <div>{substatus || status}</div>
        </Components.tooltip>
      </span>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_pipelinestatus);
