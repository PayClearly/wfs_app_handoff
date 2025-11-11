import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_badges_acceptsmethod extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { data } = this.props;
    if (typeof data === 'object' && data.isNonAcceptor) {
      return (
        <span style={{ fontSize: '28px' }} className="text-primary">
          <Components.tooltip className="float-start pe-2">
            <Components.icon icon="currency-usd-off" />
            <div>Does not accept payments</div>
          </Components.tooltip>
        </span>
      );
    }

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
          <Components.tooltip className="float-start pe-2">
            <Components.icon icon="credit-card-outline" alertIcon="alert-circle" alert={_try(() => data.cardAlert)} />
            <div>Card</div>
          </Components.tooltip>
        }
        {concierge &&
          <Components.tooltip className="float-start pe-2">
            <Components.icon icon="headset" alertIcon="alert-circle" alert={_try(() => data.conciergeAlert)} />
            <div>Concierge</div>
          </Components.tooltip>
        }
        {ACH &&
          <Components.tooltip className="float-start pe-2">
            <Components.icon icon="bank" alertIcon="alert-circle" alert={_try(() => data.achAlert)} />
            <div>ACH</div>
          </Components.tooltip>
        }
        {check &&
          <Components.tooltip className="float-start pe-2">
            <Components.icon icon="email-outline" alertIcon="alert-circle" alert={_try(() => data.checkAlert)} />
            <div>Check</div>
          </Components.tooltip>
        }

      </span>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_acceptsmethod);


