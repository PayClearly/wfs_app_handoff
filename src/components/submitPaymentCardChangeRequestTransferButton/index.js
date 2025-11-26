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

class components_submitPaymentCardChangeRequestTransferButton extends Component {
  state = {};

  componentWillUnmount() {
    if (typeof this.props.clearStatusErrors === 'function' && this.props.achTransfersStatus && this.props.achTransfersStatus.creatingError) {
      this.props.clearStatusErrors();
    }
  }

  submitTransferForSinglePaymentCardCR = () => {
    const { fundingDetails, integrations, paymentCardCRId } = this.props;
    if (!paymentCardCRId) return;
    if (!_try(() => fundingDetails.unfundedPaymentCardChangeRequests[paymentCardCRId])) return;
    const achFundingSourceIntegration = integrations.achFundingSource;

    const amount = fundingDetails.unfundedPaymentCardChangeRequests[paymentCardCRId];
    const _forPaymentCardChangeRequests = {
      [paymentCardCRId]: amount,
    };

    const now = new Date();
    const localNowDate = now.toLocaleDateString('en-US');

    const data = {
      amount,
      note: `Manual Batch Transfer - ${localNowDate}`,
      _forPaymentCardChangeRequests,
      fundingSource: achFundingSourceIntegration.name || '',
    };

    this.props.createAchTransfer(data);
  };

  submitTransferForAllPaymentCardCRs = () => {
    const { fundingDetails, integrations } = this.props;
    const unfundedPaymentCardChangeRequests = fundingDetails.unfundedPaymentCardChangeRequests;
    if (!_try(() => Object.keys(unfundedPaymentCardChangeRequests).length)) return;
    const achFundingSourceIntegration = integrations.achFundingSource;

    const amount = Object.keys(unfundedPaymentCardChangeRequests).reduce((total, paymentCardId) => {
      return Utils.addDollars([total, _try(() => unfundedPaymentCardChangeRequests[paymentCardId], 0)]);
    }, 0);
    const _forPaymentCardChangeRequests = unfundedPaymentCardChangeRequests;

    const now = new Date();
    const localNowDate = now.toLocaleDateString('en-US');

    const data = {
      amount,
      note: `Manual Batch Transfer - ${localNowDate}`,
      _forPaymentCardChangeRequests,
      fundingSource: achFundingSourceIntegration.name || '',
    };

    this.props.createAchTransfer(data);
  };

  render() {
    const { fundingDetails, policies, paymentCardCRId, achTransfersStatus } = this.props;
    const earmarkFunding = _try(() => fundingDetails.earmarkEnforced);
    if (!earmarkFunding || !policies.canCreate) return null;

    const creating = achTransfersStatus.creating;
    const disabled = creating;
    let correctButton = this.state.paymentCardCRId === 'submittedPaymentCardCR';
    if (paymentCardCRId) {
      correctButton = this.state.paymentCardCRId === paymentCardCRId;
    }

    return (
      <Components.button
        buttonText={paymentCardCRId ? 'Fund' : 'Fund All'}
        onClick={(e) => {
          e.stopPropagation();
          if (paymentCardCRId) {
            this.setState({ paymentCardCRId }, () => {
              this.submitTransferForSinglePaymentCardCR();
            });
          } else {
            this.setState({ paymentCardCRId: 'submittedPaymentCardCR' }, () => {
              this.submitTransferForAllPaymentCardCRs();
            });
          }
        }}
        ariaLabel="Fund"
        className={this.props.className ? `components_submitPaymentCardChangeRequestTransferButton do-not-expand ${this.props.className}${!paymentCardCRId ? ' btn-sm' : ''}` : `components_submitPaymentCardChangeRequestTransferButton do-not-expand btn btn-primary${!paymentCardCRId ? ' btn-sm' : ''}`}
        disabled={disabled}
        updating={correctButton && creating}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_submitPaymentCardChangeRequestTransferButton);

