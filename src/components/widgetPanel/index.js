import { connect, Component } from 'component';

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state) => ({
  routeConfig: _try(() => Selectors.routeConfig(state), {}),
  features: _try(() => Selectors.featureFlags(state), {}),
});

const mapDispatchToProps = () => ({});

class components_widgetPanel extends Component {

  render() {
    const {
      availableFunds,
      spendSummary,
      pendingPayments,
      paymentMethodsStatus,
      cardsIntegrationStatus,
      erpIntegrationStatus,
      dailySpendGraph,
      spendByVendorPieChart,
      cardsActivity,
    } = this.props.routeConfig.config || {};

    return (
      <div className="components_widgetPanel">
        <div className="row">
          {
            availableFunds
            && (
              <div className="col-md-3 mb-4">
                <Components.widgets.availablefunds />
              </div>
            )
          }
          {
            spendSummary
            && (
              <div className="col-md-3 mb-4">
                <Components.widgets.spendSummary />
              </div>
            )
          }
          {
            pendingPayments
            && (
              <Components.featureFlagWrapper featureKey="pendingPayments">
                <div className="col-md-3 mb-4">
                  <Components.widgets.pendingpayments />
                </div>
              </Components.featureFlagWrapper>
            )
          }
          {
            paymentMethodsStatus
            && (
              <div className="col-md-3 mb-4">
                <Components.widgets.paymentMethodsStatus />
              </div>
            )
          }
          {
            cardsIntegrationStatus
            && (
              <div className="col-md-3 mb-4">
                <Components.widgets.integrationStatus type="cardsIntegration" />
              </div>
            )
          }
          {
            erpIntegrationStatus
            && (
              <Components.featureFlagWrapper featureKey="erpIntegrationStatus">
                <div className="col-md-3 mb-4">
                  <Components.widgets.integrationStatus type="erpIntegration" />
                </div>
              </Components.featureFlagWrapper>
            )
          }
        </div>
        {
          dailySpendGraph
          && (
            <div className="row">
              <div className="col-12 mb-4">
                <Components.widgets.dailyspendgraph />
              </div>
            </div>
          )
        }
        {
          cardsActivity
          && (
            <div className="row">
              <div className="col-12 mb-4">
                <Components.widgets.cardsActivity />
              </div>
            </div>
          )
        }
        {
          !spendByVendorPieChart
          && (
            <div className="row">
              <div className="col-12 mb-4">
                <Components.widgets.spendbyvendorpiechart />
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_widgetPanel);


