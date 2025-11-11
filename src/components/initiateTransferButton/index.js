import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    fundingDetails: Selectors.funding(state),
    integrations: Selectors.integrations(state),
    achTransfersStatus: state.account.achTransfers.status,
    policies: Selectors.entity('achTransfers_idOrganization_idAccount')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createAchTransfer: (data) => {
      return dispatch(Store.account.createAchTransfer(data));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsAchTransfers());
    },
  });
};

class components_initiateTransferButton extends Component {
  state = {};

  componentDidMount() { }
  componentWillUnmount() {
    if (typeof this.props.clearStatusErrors === 'function' && this.props.achTransfersStatus && this.props.achTransfersStatus.creatingError) {
      this.props.clearStatusErrors();
    }
  }

  submitTransfer = () => {
    const { fundingDetails, integrations } = this.props;
    const achFundingSourceIntegration = integrations.achFundingSource;
    const batchBased = _try(() => fundingDetails.earmarkEnforced);
    const now = new Date();
    const localNowDate = now.toLocaleDateString('en-US');

    const data = {
      amount: fundingDetails.currentTransferPool,
      fundingSource: achFundingSourceIntegration.name || '',
      note: `Manual ${batchBased ? 'Batch' : 'Standard'} Transfer - ${localNowDate}`,
    };

    if (batchBased) {
      data._forPayments = _try(() => fundingDetails.unfundedPayments);
      data._forPaymentCardChangeRequests = _try(() => this.props.fundingDetails.unfundedPaymentCardChangeRequests);
    }

    this.props.createAchTransfer(data);
  }

  render() {
    const { fundingDetails, policies, achTransfersStatus } = this.props;
    if (!policies.canCreate) return null;

    const creating = achTransfersStatus.creating;
    const disabled = creating;
    const correctButton = this.state.clicked;

    const fundingAccountLinked = _try(() => fundingDetails.achAccountLinked);
    const autoFundingEnabled = _try(() => fundingDetails.automaticFundingEnabled);

    return (
      <Fragment>
        <Components.button
          buttonText="Initiate Transfer Now"
          onClick={(e) => {
            e.stopPropagation();
            this.setState({ clicked: true }, () => {
              this.submitTransfer();
            });
          }}
          ariaLabel="Initiate Transfer Now"
          className={this.props.className ? `components_initiateTransferButton do-not-expand ${this.props.className}` : 'components_initiateTransferButton btn btn-primary'}
          disabled={correctButton && disabled}
          updating={correctButton && creating}
        />
        {/* {fundingAccountLinked && !autoFundingEnabled &&
          <div className="notify">
            <span className="heartbit danger" />
            <span className="point danger" />
          </div>
        } */}
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_initiateTransferButton);


