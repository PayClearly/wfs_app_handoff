import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_badges_method extends Component {




  render() {
    const { data } = this.props;

    let against = {};
    if (typeof data === 'string') {
      against.vCard = data === 'vCard';
      against.ACH = data === 'ACH';
      against.check = data === 'check';
      against.concierge = data === 'concierge';
    } else {
      against = data || {};
    }

    const { vCard, ACH, check, concierge } = against;

    return (
      <span style={{ fontSize: '28px' }} className="text-primary">

        {vCard &&
          <Components.tooltip className="d-inline">
            <span><i className="mdi mdi-credit-card-outline" /></span>
            <span>Card</span>
          </Components.tooltip>
        }
        {concierge &&
          <Components.tooltip className="d-inline">
            <span><i className="mdi mdi-headset" /></span>
            <span>Concierge</span>
          </Components.tooltip>
        }
        {ACH &&
          <Components.tooltip className="d-inline">
            <span><i className="mdi mdi-bank" /></span>
            <span>ACH</span>
          </Components.tooltip>
        }
        {check &&
          <Components.tooltip className="d-inline">
            <span><i className="mdi mdi-email-outline" /></span>
            <span>Check</span>
          </Components.tooltip>
        }

      </span>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_method);


