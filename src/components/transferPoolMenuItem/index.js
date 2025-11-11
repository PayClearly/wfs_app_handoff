import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    achPolicies: Selectors.entity('achTransfers_idOrganization_idAccount')(state),
    fundingDetails: Selectors.funding(state),
    unfundedBatches: state.account.accountBalances.data.item.paymentStatuses && state.account.accountBalances.data.item.paymentStatuses.funding.unfundedBatches || [],
    achAccountDetails: state.account.achAccountDetails.data.item,
    integrations: Selectors.integrations(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openFundingModal: (data) => {
      return dispatch(Store.router.openModal('Components.modals.funding', data));
    },
  });
};

class components_transferPoolMenuItem extends Component {
  state = {
    popoverOpen: false,
  }




  render() {
    return (
      <Fragment>
        {_try(() => this.props.fundingDetails.currentTransferPool) > 0 &&
          <div className={`components_transferPoolMenuItem main-header-icon-test${_try(() => this.props.fundingDetails.currentTransferPool) > 0 ? '' : ' hidden'}`} role="ToolTip" id="transfer-pool" onClick={this.props.openFundingModal} >
            <i style={{ fontSize: '34px' }} className="mdi text-primary mdi-inbox-arrow-down" />
            {(!this.props.achAccountDetails.fundingPreferences || !this.props.achAccountDetails.fundingPreferences.automaticFundingType) && this.props.achPolicies.canCreate &&
              <div className="notify">
                <span className="heartbit danger" />
                <span className="point danger" />
              </div>
            }
          </div>
        }
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_transferPoolMenuItem);


