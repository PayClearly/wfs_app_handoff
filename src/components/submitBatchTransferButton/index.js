import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
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

class components_submitBatchTransferButton extends Component {
  state = {};

  componentDidMount() { }
  componentWillUnmount() {
    if (typeof this.props.clearStatusErrors === 'function' && this.props.achTransfersStatus && this.props.achTransfersStatus.creatingError) {
      this.props.clearStatusErrors();
    }
  }

  submitTransferForSingleBatch = () => {
    const { fundingDetails, integrations, paymentsForBatch } = this.props;
    if (!paymentsForBatch) return;
    const achFundingSourceIntegration = integrations.achFundingSource;

    const _forPayments = {};
    const amount = paymentsForBatch.reduce((total, paymentId) => {
      if (_try(() => fundingDetails.unfundedPayments[paymentId])) {
        const paymentAmount = fundingDetails.unfundedPayments[paymentId];
        _forPayments[paymentId] = paymentAmount;
        return Utils.addDollars([total, paymentAmount]);
      }
      return total;
    }, 0);

    const now = new Date();
    const localNowDate = now.toLocaleDateString('en-US');

    const data = {
      amount,
      note: `Manual Batch Transfer - ${localNowDate}`,
      _forPayments,
      fundingSource: achFundingSourceIntegration.name || '',
    };

    this.props.createAchTransfer(data);
  };

  submitTransferForAllBatches = () => {
    const { fundingDetails, integrations } = this.props;
    if (!_try(() => Object.keys(fundingDetails.unfundedPayments).length)) return;
    const achFundingSourceIntegration = integrations.achFundingSource;

    const unfundedPayments = _try(() => fundingDetails.unfundedPayments);
    const _forPayments = unfundedPayments;
    const amount = Object.keys(unfundedPayments).reduce((total, paymentId) => {
      if (_try(() => fundingDetails.unfundedPayments[paymentId])) {
        const paymentAmount = fundingDetails.unfundedPayments[paymentId];
        return Utils.addDollars([total, paymentAmount]);
      }
      return total;
    }, 0);

    const now = new Date();
    const localNowDate = now.toLocaleDateString('en-US');

    const data = {
      amount,
      note: `Manual Batch Transfer - ${localNowDate}`,
      _forPayments,
      fundingSource: achFundingSourceIntegration.name || '',
    };

    this.props.createAchTransfer(data);
  };

  render() {
    const { fundingDetails, policies, batchId, achTransfersStatus } = this.props;
    const earmarkFunding = _try(() => fundingDetails.earmarkEnforced);
    if (!earmarkFunding || !policies.canCreate) return null;

    const creating = achTransfersStatus.creating;
    const disabled = creating;
    let correctButton = this.state.batchId === 'submittedBatch';
    if (batchId) {
      correctButton = this.state.batchId === batchId;
    }

    return (
      <Components.button
        buttonText={batchId ? 'Fund' : 'Fund All'}
        onClick={(e) => {
          e.stopPropagation();
          if (batchId) {
            this.setState({ batchId }, () => {
              this.submitTransferForSingleBatch();
            });
          } else {
            this.setState({ batchId: 'submittedBatch' }, () => {
              this.submitTransferForAllBatches();
            });
          }
        }}
        ariaLabel="Fund"
        className={this.props.className ? `components_submitBatchTransferButton do-not-expand ${this.props.className}${!batchId ? ' btn-sm' : ''}` : `components_submitBatchTransferButton do-not-expand btn btn-primary${!batchId ? ' btn-sm' : ''}`}
        disabled={disabled}
        updating={correctButton && creating}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_submitBatchTransferButton);


