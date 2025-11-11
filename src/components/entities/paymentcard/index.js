import { connect, Component, bindActionCreators, Fragment } from 'component';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    cardPolicies: Selectors.entity('cards_idOrganization_idAccount')(state),
    forms: state.forms,
    status: state.account.paymentCards.status,
    paymentCards: state.account.paymentCards.data.items,
    vCards: _try(() => state.account.cardsIntegration.data.resources.vCards),
    cardsActivity: _try(() => Selectors.cardsActivity(state), {}),
    cardsIntegrationUpdating: _try(() => state.account.cardsIntegration.status.updating),
    paymentCardsWithActiveChangeRequests: Selectors.paymentCardChangeRequests(state).paymentCardsWithActiveChangeRequests,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updatePaymentCard: (data) => {
      return dispatch(Store.account.updatePaymentCard(data, 'update'));
    },
  });
};

class components_entities_paymentcard extends Component {
  state = {
    formName: 'Components.forms.paymentCard',
    editBtnText: 'Edit Purchase Card',
    disabledEditClicked: false,
  }

  componentDidMount() {}
  componentWillReceiveProps(nextProps = {}) {
    if (_try(() => this.props.paymentCardsWithActiveChangeRequests[this.props.id]) && !_try(() => nextProps.paymentCardsWithActiveChangeRequests[nextProps.id])) {
      this.setState({ disabledEditClicked: false });
    }
  }
  componentWillUnmount() {}

  onSubmit = () => {
    const { id, paymentCards, vCards } = this.props;
    const paymentCard = paymentCards[id];
    const paymentCardForm = this.props.forms[this.state.formName][id]._values;
    const transactionInformation = _try(() => this.props.cardsActivity.totalsByCard[paymentCard.vCard], {});

    const customFields = this.props.forms['Components.forms.custom'] &&
    this.props.forms['Components.forms.custom'][`paymentCardFields-${id}`] &&
    this.props.forms['Components.forms.custom'][`paymentCardFields-${id}`]._values || {};

    const trigger = paymentCardForm.triggerType && {
      type: paymentCardForm.triggerType,
      min: paymentCardForm.triggerMin || null,
      max: paymentCardForm.triggerMax,
      frequency: paymentCardForm.triggerFrequency || null,
      specificDate: paymentCardForm.specificDate ? parseInt(paymentCardForm.specificDate, 10) : null,
    };

    const { name, availableBalance, maxUses, validThrough, status, region } = paymentCardForm;
    // must convert validThrough to UTC noon for comparison
    const validThroughUTCNoon = _try(() => new Date(validThrough));
    _try(() => validThroughUTCNoon.setUTCHours(12, 0, 0, 0));
    
    // New card amount is the available balance plus total already spent
    const amount = Utils.addDollars([Number(availableBalance), Number(_try(() => transactionInformation.totalAuthorized, 0))]);

    // determine if virtual card is getting changed
    const currentVirtualCard = vCards[paymentCard.vCard]; 
    const maxUsesFormatted = (maxUses === 'Max') ? '99999' : maxUses;
    const customFieldsDiff = _compareAndGetEFSCustomFields(currentVirtualCard.customFields, customFields);
    let virtualCard = {};

    const virtualCardEdited = currentVirtualCard.amount !== amount ||
    currentVirtualCard.maxUses.toString() !== maxUsesFormatted.toString() ||
    currentVirtualCard.validThrough !== validThroughUTCNoon.getTime() ||
    currentVirtualCard.region !== region ||
    currentVirtualCard.status !== status;

    const customFieldsChanged = Object.keys(customFieldsDiff).length;
    if (virtualCardEdited || (customFieldsChanged && !transactionInformation.used)) {
      virtualCard = {
        amount,
        maxUses: maxUsesFormatted,
        validThrough: validThroughUTCNoon.getTime(),
        region,
        status,
      };

      // efs protection handling issues with customfields if card has been used
      if (customFieldsChanged && !transactionInformation.used) virtualCard.customFields = customFieldsDiff;
    }

    // funding amount is the difference of current remaining funds on card and new desired card balance (availableBalance)
    const fundingAmount = Utils.addDollars([Number(availableBalance), -Number(_try(() => transactionInformation.remaining, currentVirtualCard.amount) || currentVirtualCard.amount)]);

    const paymentCardPayload = {
      id,
      name,
      customFields,
      trigger,
    };

    if (Object.keys(virtualCard).length) {
      paymentCardPayload.virtualCard = virtualCard;
      paymentCardPayload.fundingAmount = !fundingAmount ? 0 : fundingAmount;
    }

    this.props.updatePaymentCard([paymentCardPayload]);
    this.setState({ showPaymentCardCreatedNotification: false });
  }

  onCancel = () => {
    this.setState({ blurAll: false });
  }

  render() {
    const { id, cardPolicies, status } = this.props;
    const form = (_try(() => this.props.forms[this.state.formName][id])) || {};

    const paymentCard = this.props.paymentCards[id]; 
    const virtualCard = this.props.vCards[paymentCard.vCard] || {};
    const initialFormData = { ...paymentCard, virtualCard };

    const customFieldsForm = _try(() => this.props.forms['Components.forms.custom'][`paymentCardFields-${initialFormData.id}`]) || {};
    const transactionInformation = this.props.cardsActivity.totalsByCard[paymentCard.vCard] || {};


    const updating = status.updating;
    const updateDisabled = updating || !form._allValid || (form._allInitial && customFieldsForm._allInitial) || !customFieldsForm._allValid;
    const cannotUpdate = (_try(() => transactionInformation.status === 'cancelled') || _try(() => paymentCard.status === 'cancelled'));
    const canUpdate = cardPolicies.canUpdate && !cannotUpdate;

    return (
      <Components.entities.entitywrapper
        accountId={this.props.accountId}
        canRead={cardPolicies.canRead}
        canUpdate={canUpdate}
        clearStatusErrors={this.props.clearStatusErrors}
        editBtnText={this.state.editBtnText}
        editDisabled={this.props.cardsIntegrationUpdating || status.updating || _try(() => this.props.paymentCardsWithActiveChangeRequests[id])}
        error={status.updatingError}
        onCancel={this.onCancel}
        onDisabledClick={() => { this.setState({ blurAll: true }); }}
        onDisabledEditClick={() => { this.setState(prevState => ({ disabledEditClicked: !prevState.disabledEditClicked })); }}
        onSubmit={this.onSubmit}
        orgId={this.props.orgId}
        updateDisabled={updateDisabled}
        updating={updating}
        wrapperClasses={this.props.wrapperClasses || 'p-4'}
        editButtonClasses="payment-card-edit-button"
      >
        <Components.overviews.paymentcard id={id} disabledEditClicked={this.state.disabledEditClicked} />
        <Components.forms.paymentCard
          blurAll={this.state.blurAll}
          formKey={initialFormData.id}
          editForm
          initialFormData={initialFormData}
          readyToUpdate={!updateDisabled}
          transactionInformation={transactionInformation}
          disabled={updating}
          virtualCard={virtualCard}
        />
      </Components.entities.entitywrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_paymentcard);

// Internal Helper Functions ... 
function _compareAndGetEFSCustomFields(current = {}, incoming = {}) {
  const diff = {};
  Object.keys(current).forEach((key) => {
    if (_try(() => key.indexOf('efs-') === 0)) {
      if ((current[key] !== _try(() => incoming[key])) && incoming[key]) {
        diff[key] = incoming[key];
      } 
    }
  });

  return diff;
}

// GENERATOR_TYPE='component';
