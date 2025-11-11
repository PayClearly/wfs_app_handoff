import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    cardPolicies: Selectors.entity('cardsIntegration_idOrganization_idAccount')(state),
    pCards: _resolve(state, 'account.cardsIntegration.data.resources.pCards', {}),
    status: _resolve(state, 'account.cardsIntegration.status', {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updatePCard: (data) => {
      return dispatch(Store.account.updateCardsIntegrationPCard(data));
    },
  });
};

class components_entities_plasticcard extends Component {
  state = {
    formName: 'Components.forms.plasticcard',
    editBtnText: 'Edit Card',
  }




  on = {
    submit: () => {
      const { id } = this.props;
      const {
        assignedTo,
        cardGroup,
        cardMemo,
        cycleIndicator,
        cycleRefreshDay,
        cycleTransactionAmountLimit,
        cycleTransactionCountLimit,
        dailyTransactionAmountLimit,
        dailyTransactionCountLimit,
        region,
        transactionLimit,
      } = this.props.forms[this.state.formName][id]._values;

      const data = {
        id,
        assignedTo,
        cardGroup,
        cardMemo,
        cycleIndicator,
        cycleRefreshDay,
        cycleTransactionAmountLimit,
        cycleTransactionCountLimit,
        dailyTransactionAmountLimit,
        dailyTransactionCountLimit,
        region,
        transactionLimit,
      };

      this.props.updatePCard(data);
    },
    cancel: () => {
      this.setState({ blurAll: false });
    },
  }

  render() {
    const { id, pCards, forms, accountId, orgId, cardPolicies, status } = this.props;
    const pCard = pCards[id];
    const form = (_try(() => forms[this.state.formName][id])) || {};

    const inactiveCard = pCard.status === 'stolen' || pCard.status === 'cancelled' || pCard.status === 'lost';
    const canRead = cardPolicies.canRead;
    const canUpdate = cardPolicies.canUpdate && !inactiveCard;
    const { updating, updatingError } = status;
    const updateDisabled = updating || !form._allValid || form._allInitial;
    if (!pCard.cardHolderName) return <div style={{ height: '500px' }}><Components.spinner /></div>;

    return (
      <Fragment>

        <Components.entities.entitywrapper
          className="components_entities_plasticcard"
          accountId={accountId}
          orgId={orgId}
          canRead={canRead}
          canUpdate={canUpdate}
          clearStatusErrors={this.props.clearStatusErrors}
          editDisabled={updating}
          onDisabledClick={() => this.setState({ blurAll: true })}
          onSubmit={this.on.submit}
          onCancel={this.on.cancel}
          updateDisabled={updateDisabled}
          error={updatingError}
          editBtnText={this.state.editBtnText}
          updating={updating}
          wrapperClasses="p-4"
        >
          <Components.overviews.plasticcard data={pCard} />
          <Components.forms.plasticcard
            forUpdate
            formKey={id}
            initialFormData={pCard}
            disabled={updating}
            status={status}
          />
        </Components.entities.entitywrapper>
      </Fragment>

    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_plasticcard);


