import { connect, Component } from 'component';

import Components from 'components';
import './index.scss';

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_badges_psopDeliveryMethod extends Component {
  render() {
    const { data } = this.props;

    if (!data || data === 'Unknown') { return <div />; }

    let iconClass;

    if (data === 'Email') {
      iconClass = 'mdi mdi-email';
    }
    if (data === 'Fax') {
      iconClass = 'mdi mdi-fax';
    }
    if (data === 'Phone') {
      iconClass = 'mdi mdi-phone';
    }
    if (data === 'Portal') {
      iconClass = 'mdi mdi-web';
    }
    if (data === 'Automation') {
      iconClass = 'mdi mdi-robot-outline';
    }

    return (
      <Components.tooltip className="float-start pe-2 text-secondary">
        <div style={{ fontSize: '28px' }}><i className={iconClass} /></div>
        <div>{data}</div>
      </Components.tooltip>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_psopDeliveryMethod);
