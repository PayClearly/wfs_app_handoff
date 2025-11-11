import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => ({
  checksIntegration: _try(() => Selectors.integrations(state).checksIntegration, {}),
});

const mapDispatchToProps = (dispatch, props) => ({

});

const mapResourcesToProps = (state, props) => ({

});

class components_integrationcomps_checksIntegration_GALILEO_overviews_account extends Component {
  render() {
    const hasActivityAccount = this.props.checksIntegration.details
      && this.props.checksIntegration.data.details.checkActivityAccountPRN
      && this.props.checksIntegration.data.resources.accounts
      && this.props.checksIntegration.data.resources.accounts.default;

    if (!hasActivityAccount) {
      return (
        <div className="my-0 ms-1">
          No activity account configured.
        </div>
      );
    }

    const balance = this.props.checksIntegration.data.resources.accounts.default.availableBalance;
    const prn = this.props.checksIntegration.data.details.checkActivityAccountPRN;

    return (
      <div>
        <div className="my-0 ms-1">
          Activity Account Balance: {balance}
        </div>
        <div className="my-0 ms-1">
          Activity Account PRN: {prn}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_checksIntegration_GALILEO_overviews_account);


