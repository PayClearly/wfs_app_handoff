import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    cardPolicies: Selectors.entity('cardsIntegration_idOrganization_idAccount')(state),
    forms: state.forms,
    routeParams: state.router.route.params,
    status: _try(() => state.account.cardsIntegration.status, {}),
    cardsIntegration: _try(() => Selectors.integrations(state).cardsIntegration),
    loaded: _try(() => Selectors.integrations(state).cardsIntegration.status.fetched, false),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    cardsIntegrationCreatePCard: (card) => {
      dispatch(Store.account.createCardsIntegrationPCard(card));
    },
    cardsIntegrationUpdatePCard: (card) => {
      dispatch(Store.account.updateCardsIntegrationPCard(card));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsIntegration('cardsIntegration'));
    },
    goToPlasticCardTable: (routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo('history', routeParams, routeOptions));
    },
  });
};

class components_creators_plastic extends Component {

  state = {
    createFormActive: true,
    showPlasticCardCreatedNotification: false,
    formName: 'Components.forms.plasticcard',
    formKey: 'default',
  };

  onCreate = () => {
    if (this.props.forCreate) {
      this.props.resetForm(this.state.formName, this.state.formKey, this.props.forms[this.state.formName][this.state.formKey]._values);
    }
    if (this.props.close && typeof this.props.close === 'function') this.props.close();
    else this.setState({ showPlasticCardCreatedNotification: true });
  }

  onDisabledClick = () => {
    this.setState({ blurAll: true });
  }

  onSubmit = () => {
    this.setState({ showPlasticCardCreatedNotification: false });
    const formKey = this.props.id || 'default';
    let fields = { ...this.props.forms['Components.forms.plasticcard'][formKey]._values };

    fields = Object.keys(fields)
      .filter(key => fields[key] !== '')
      .reduce((acc, key) => {
        acc[key] = fields[key];
        return acc;
      }, {});

    [
      'cycleTransactionAmountLimit',
      'cycleTransactionAmountUsed',
      'cycleTransactionCountLimit',
      'cycleTransactionCountUsed',
      'dailyTransactionAmountLimit',
      'dailyTransactionAmountUsed',
      'dailyTransactionCountLimit',
      'dailyTransactionCountUsed',
      'transactionAmountLimit',
    ].forEach((key) => {
      if (!fields[key]) return;
      fields[key] = parseFloat(fields[key], 10);
    });

    if (this.props.forReissue) this.props.cardsIntegrationUpdatePCard({ id: this.props.id, ...fields, reissueStatus: 'requested' });
    if (!this.props.forReissue) this.props.cardsIntegrationCreatePCard({ id: this.props.id, ...fields });
  };

  render() {
    const { canCreate } = this.props.cardPolicies;
    if (!this.props.loaded) return <Components.spinner />;

    // Check for integrations
    if (!(this.props.cardsIntegration.linked)) {
      return (
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">No Payment Credentials Found</h4>
          You do not have the capability to pay via any payment method. Please go to your account settings to configure.
        </div>
      );
    }
    return (
      <Components.creators.creatorwrapper
        className="components_creators_plastic"
        canCreate={canCreate}
        createFormActive={this.state.createFormActive}
        status={this.props.status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Components.forms.plasticcard
          initialFormData={this.props.initialFormData || {}}
          formKey={this.props.id}
          forCreate={!this.props.forReissue}
          forReissue={this.props.forReissue}
          blurAll={this.state.blurAll}
          navigateToPlasticCardTable={() => this.props.goToPlasticCardTable({ card: this.props.status.created, tab: 'plasticCards' })}
          onDisabledClick={this.onDisabledClick}
          onSubmit={this.onSubmit}
          showCreatedNotification={this.state.showPlasticCardCreatedNotification}
          status={this.props.status}
        />
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_plastic);

