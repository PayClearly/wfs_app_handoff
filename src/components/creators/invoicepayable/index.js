import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import FuzzySet from 'fuzzyset.js';

// import Utils from 'utils';
import Store from 'store';
//
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    policies: Selectors.entity('payments_idOrganization_idAccount')(state),
    derivedFormData: _try(() => Selectors.paymentform(props.formKey || 'default')(state), {}),
    created: state.account.paymentStatuses.data.created,
    status: state.account.paymentStatuses.status,
    instantFundingCreateDisabled: _try(() => Selectors.funding(state).instantTransfer.enabled) && (_try(() => Selectors.funding(state).earmarkEnforced) ? (!state.account.paymentStatuses.status.fetched && !state.account.achTransfers.status.fetched) : !state.account.accountBalances.status.fetched),
    orgId: state.organization.data.id,
    accountId: state.account.data.id,
    accountVendors: state.account.accountVendors.data.items,

    forms: state.forms,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    create: (data, instantTransfer) => {
      dispatch(Store.account.createPayments(data, instantTransfer));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    blurForm: (name, key, fields) => {
      dispatch(Store.forms.blur(name, key, fields));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsPayments());
    },
    navigateToHistory: (routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo('history', routeParams, routeOptions));
    },
  });
};

class components_creators_payment extends Component {

  state = {
    createFormActive: true,
    formName: 'Components.forms.payment',
    formKey: 'default',
    fuzzySet: null,
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onCreate = () => {
    const formKey = this.props.formKey || this.state.formKey;
    this.props.resetForm(this.state.formName, formKey, this.props.forms[this.state.formName][formKey]._values);

    this.setState({ disabledClick: false });
  }

  onDisabledClick = () => {
    const formKey = this.props.formKey || this.state.formKey;
    this.props.blurForm(this.state.formName, formKey, this.props.forms[this.state.formName][formKey]._values);

    if (this.props.instantFundingCreateDisabled) {
      this.setState({ disabledClick: true });
    }
  }
  navigateToPaymentHistory = (e) => {
    e.preventDefault();
    const paymentId = _try(() => Object.keys(this.props.created.payments[this.props.orgId][this.props.accountId])[0]) || null;
    const params = {
      npi: paymentId,
    };
    this.props.navigateToHistory(params);
    this.props.handleClose();
  }

  render() {
    const { canCreate } = this.props.policies;
    if (!canCreate) return <Components.invalidpermissions />;

    const formKey = this.props.formKey || this.state.formKey;
    const formValues = _try(() => this.props.forms['Components.forms.invoicedetails'][formKey]._values, {});
    const initialData = { ...formValues, fields: { ...formValues } };
    const fuzzySet = FuzzySet(Object.values(this.props.accountVendors).filter(vendor => vendor.active).map(vendor => vendor.name));
    initialData.vendorName = _try(() => fuzzySet.get(formValues.vendorName, [], 0.5)[0][1], formValues.vendorName);

    return (
      <Components.creators.creatorwrapper
        className="components_creators_payment"
        canCreate={canCreate}
        createFormActive={this.state.createFormActive}
        status={this.props.status}
        onCreateNotification={<div>Payment successfully created! You can edit vendors below, or create another.<button className="btn btn-primary ms-5" onClick={e => this.navigateToPaymentHistory(e)}>View Payment History</button></div>}
        showErrorNotification
        createDisabled={!_try(() => this.props.derivedFormData.valid) || this.props.instantFundingCreateDisabled}

        clearStatusErrors={this.props.clearStatusErrors}

        onCreate={this.onCreate}
        onDisabledClick={this.onDisabledClick}
      >
        <Fragment>
          <Components.forms.payment initialData={initialData} formKey={formKey} invoiceId={formKey} />
          {this.props.instantFundingCreateDisabled && this.state.disabledClick && this.props.forms[this.state.formName][formKey]._allValid &&
            <div className="alert alert-warning" role="alert">
              We are calculating the necessary funds for your instant transfer. Please try again in a moment once our calculations have completed.
            </div>
          }
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_payment);


