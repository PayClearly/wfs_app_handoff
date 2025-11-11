import { connect, Component } from 'component';

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_routes_wfsDashboard extends Component {




  render() {
    return (
      <Components.cardsroute>
        <Components.title />
        <Components.widgetPanel
          config={{
            availableFunds: false,
            spendSummary: true,
            pendingPayments: false,
            cardsIntegrationStatus: true,
            erpIntegrationStatus: false,
            dailySpendGraph: false,
            cardsActivity: true,
            spendByVendorPieChart: false,
          }}
        />
      </Components.cardsroute>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_routes_wfsDashboard);


