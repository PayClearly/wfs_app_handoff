import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    cardPolicies: Selectors.entity('cards_idOrganization_idAccount')(state),
    created: state.account.paymentCards.data.created,
    forms: state.forms,
    routeParams: state.router.route.params,
    status: state.account.paymentCards.status,
    funding: Selectors.funding(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createPaymentCard: (card) => {
      dispatch(Store.account.createPaymentCard(card));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsPaymentCards());
    },
    goToPaymentCardTable: (routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo('history', routeParams, routeOptions));
    },
  });
};

class components_creators_paymentcard extends Component {

  state = {
    createFormActive: true,
    showPaymentCardCreatedNotification: false,
    formName: 'Components.forms.createpaymentcard',
    formKey: 'default',
  };




  onCreate = () => {
    const formKey = this.props.formKey || this.state.formKey;
    this.props.resetForm('Components.forms.createpaymentcard', formKey, this.props.forms['Components.forms.createpaymentcard'][formKey]._values);
    this.props.resetForm('Components.forms.custom', formKey, this.props.forms['Components.forms.custom'][`paymentCardFields-${formKey}`]._values);
    this.setState({ showPaymentCardCreatedNotification: true });
  }

  onDisabledClick = () => {
    this.setState({ blurAll: true });
  }

  onSubmit = () => {
    const formKey = this.props.formKey || this.state.formKey;

    this.setState({ showPaymentCardCreatedNotification: false });

    const paymentCardForm = this.props.forms['Components.forms.createpaymentcard'][formKey]._values;
    const customFields = this.props.forms['Components.forms.custom'] &&
      this.props.forms['Components.forms.custom'][`paymentCardFields-${formKey}`] &&
      this.props.forms['Components.forms.custom'][`paymentCardFields-${formKey}`]._values || {};

    const trigger = paymentCardForm.triggerType && {
      type: paymentCardForm.triggerType,
      min: paymentCardForm.triggerMin || null,
      max: paymentCardForm.triggerMax,
      frequency: paymentCardForm.triggerFrequency || null,
      specificDate: Number(paymentCardForm.specificDate) || null,
    };

    const { name, amount, maxUses, validThrough, region } = paymentCardForm;

    const paymentCard = {
      name,
      customFields,
      trigger,
      virtualCard: {
        amount,
        maxUses: (maxUses === 'Max') ? '99999' : maxUses,
        validThrough,
        region,
      },
      fundingAmount: Number(parseFloat(amount).toFixed(2)),
    };

    this.props.createPaymentCard([paymentCard]);
    this.setState({ showPaymentCardCreatedNotification: false });
  };

  render() {
    const { canCreate } = this.props.cardPolicies;

    if (!canCreate) return <Components.invalidpermissions />;

    return (
      <Components.creators.creatorwrapper
        className="components_creators_paymentcard"
        canCreate={canCreate}
        createFormActive={this.state.createFormActive}
        status={this.props.status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Components.forms.createpaymentcard
          blurAll={this.state.blurAll}
          navigateToPaymentCardTable={() => { return this.props.goToPaymentCardTable({ card: this.props.created.id, tab: 'paymentCards' }); }}
          onDisabledClick={this.onDisabledClick}
          onSubmit={this.onSubmit}
          showCreatedNotification={this.state.showPaymentCardCreatedNotification}
          status={this.props.status}
        />
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_paymentcard);


