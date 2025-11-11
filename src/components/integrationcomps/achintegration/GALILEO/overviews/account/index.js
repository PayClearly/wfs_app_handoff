import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  achIntegration: _try(() => Selectors.integrations(state).achIntegration, {}),
});

const mapDispatchToProps = (dispatch, props) => ({

});

const mapResourcesToProps = (state, props) => ({

});

class components_integrationcomps_achintegration_GALILEO_overviews_account extends Component {
  render() {
    const hasActivityAccount = this.props.achIntegration.details
      && this.props.achIntegration.data.details.fundingSource
      && this.props.achIntegration.data.details.fundingSource.id
      && this.props.achIntegration.data.resources.accounts
      && this.props.achIntegration.data.resources.accounts.default;

    if (!hasActivityAccount) {
      return (
        <div className="my-0 ms-1">
          No activity account configured.
        </div>
      );
    }

    const balance = this.props.achIntegration.data.resources.accounts.default.availableBalance;
    const prn = this.props.achIntegration.data.details.fundingSource.id;

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

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_achintegration_GALILEO_overviews_account);


