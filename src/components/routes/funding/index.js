import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    fundingIntegrationStatus: _try(() => state.account.fundingIntegration.status, {}),
    achTransfersStatus: _try(() => state.account.achTransfers.status, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_routes_funding extends Component {




  render() {
    const { achTransfersStatus, fundingIntegrationStatus } = this.props;
    if (!achTransfersStatus.fetched || !fundingIntegrationStatus.fetched) return <Components.spinner />;

    return (
      <Fragment>
        <div className="row mb-4">
          <div className="col-6">
            <Components.funding.deposits widget />
          </div>
          <div className="col-6">
            <Components.funding.withdrawals widget />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title mb-3">Funding Transfers</h2>
                <Components.tables.fundinghistory />
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_funding);


