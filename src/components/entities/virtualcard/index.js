import {
 connect, Component, bindActionCreators, Fragment, 
} from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
    user: state.user,
    forms: state.forms,
    policies: Selectors.entity('cardsIntegration_idOrganization_idAccount')(state),
    status: _try(() => state.account.cardsIntegration.status, {}),
    orgId: state.organization.data.id,
    accountId: state.account.data.id,
    vCards: _try(() => state.account.cardsIntegration.data.resources.vCards, {}),
    featureFlags: state.account.featureFlags.data.item,
  });

const mapDispatchToProps = (dispatch, props) => ({
    update: (data) => dispatch(Store.account.updateCardsIntegrationVCard(data)),
    clearStatusErrors: () => dispatch(Store.account.clearErrorsIntegration('cardsIntegration')),
  });

class components_entities_virtualcard extends Component {
  state = {
    formName: 'Components.forms.virtualCard',
    editBtnText: 'Edit Card',
  };

  componentDidMount() {}

  componentWillUnmount() {}

  onSubmit = () => {
    const form = this.props.forms[this.state.formName][this.props.cardId] || {};

    const formData = _adaptToAPI(form._values);
    const data = { id: this.props.cardId, ...formData };

    this.props.update(data);
  };

  onCancel = () => {
    this.setState({ blurAll: false });
  };

  render() {

    const { canRead, canUpdate, canDelete } = this.props.policies;
    const { cardId, featureFlags } = this.props;
    const canAdministrateGlobalVendors = this.props.user.privileges.data.item 
      && this.props.user.privileges.data.item.rootLevel 
      && this.props.user.privileges.data.item.rootLevel.administrateGlobalVendors;
    const paymentsTableUpdateCards = featureFlags.paymentsTableUpdateCards === 'ON';


    const card = this.props.vCards[cardId];
    const error = this.props.status.updatingError;
    const { updating } = this.props.status;
    const form = (this.props.forms[this.state.formName] && this.props.forms[this.state.formName][card.id]) || {};
    const updateDisabled = updating || !form._allValid || form._allInitial;

    const wrapperClasses = this.props.wrapperClasses || 'p-4';


    let updateAllowed = canUpdate;
    if (_try(() => card.status) === 'cancelled') { 
      updateAllowed = false; 
    }

    if (this.props.forPayment) {
      const isCancelled = this.props.paymentStatus._status === 'cancelled' || _try(() => card.status) === 'cancelled';
      const isTracked = this.props.paymentStatus._status === 'tracked';

      if ((canAdministrateGlobalVendors || (paymentsTableUpdateCards && canUpdate)) && !isCancelled && !isTracked) {
        updateAllowed = true;
      } else {
        updateAllowed = false;
      }
    }

    return (
      <Components.entities.entitywrapper
        canRead={canRead}
        canUpdate={updateAllowed}
        canDelete={this.props.forPayment ? canAdministrateGlobalVendors : canDelete}
        onSubmit={this.onSubmit}
        updating={updating}
        error={error}
        updateDisabled={updateDisabled}
        editBtnText={this.state.editBtnText}
        orgId={this.props.orgId}
        accountId={this.props.accountId}
        wrapperClasses={`${wrapperClasses} components_entities_virtualcard`}
        onDisabledClick={() => { this.setState({ blurAll: true }); }}
        onCancel={this.onCancel}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Fragment>
          <Components.overviews.virtualcardentity cardId={card.id} forPayment={this.props.forPayment} />
        </Fragment>
        <Components.forms.virtualCard
          formKey={this.props.cardId}
          initialFormData={card}
          blurAll={this.state.blurAll}
          orgId={this.props.orgId}
        />
      </Components.entities.entitywrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_virtualcard);

// Internal Helper Functions ... 
function _adaptToAPI(data) {
  // adapt valid through to UTC noon
  const validThroughUTCNoon = _try(() => new Date(data.validThrough));
  _try(() => validThroughUTCNoon.setUTCHours(12, 0, 0, 0));
  
  const toReturn = {
    amount: Number(parseFloat(data.amount).toFixed(2)),
    maxUses: parseInt(data.numberOfUses, 10),
    region: data.region,
    exactMatch: (data.requireExactMatch === 'yes' && true),
    mccs: undefined,
    tccs: undefined,
    validThrough: validThroughUTCNoon.getTime(),
    status: data.status,
  };

  const customFields = Object.keys(data).filter((key) => key.includes('customField') && data[key]);
  if (customFields.length) {
    toReturn.customFields = {};
    customFields.forEach((field) => {
      toReturn.customFields[`efs-${field}`] = data[field];
    });
  }

  return toReturn;
}

// GENERATOR_TYPE='component';
