import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('globalVendors_*')(state),
    status: state.global.procedures.status,
    procedures: state.global.procedures.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createGlobalVendorProcedure: (data, groupData) => {
      return dispatch(Store.global.createGlobalVendorProcedure(data, groupData));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      dispatch(Store.global.clearErrorsGlobalVendorProcedure());
    },

  });
};

class components_creators_globalVendorProcedure extends Component {

  state = {
    showCreatedNotification: false,
    formKey: this.props.method,
    formDelegate: { getFormAttachments: () => { } },
    formMap: {
      vCard: 'Components.forms.globalVendorProcedureVCard',
      ACH: 'Components.forms.globalVendorProcedureACH',
      check: 'Components.forms.globalVendorProcedureCheck',
    },
  };

  onCreate = () => {
    this.setState({ showCreatedNotification: true });

    this.props.resetForm(this.state.formName, this.state.formKey, INITIAL_FIELDS[this.props.method]);
  };

  submit = () => {
    const formName = this.state.formMap[this.props.method];
    const data = _try(() => this.props.forms[formName][this.props.method]._values);
    if (!data) return;
    this.props.createGlobalVendorProcedure({ ...data, ...this.state.formDelegate.getFormAttachments() }, { groupId: this.props.groupId, method: this.props.method });
    this.setState({ showCreatedNotification: false });
  };

  render() {
    const { status, forms, noAccordion, method } = this.props;
    const error = status.creatingError;
    const creating = status.creating;
    const formName = this.state.formMap[this.props.method];
    const form = _try(() => forms[formName][this.state.formKey]) || {};
    const disabled = creating || !form._allValid;

    return (
      <Components.creators.creatorwrapper
        className="components_creators_globalVendorProcedure"
        canCreate={this.props.policies.canCreate}
        useAccordion={!noAccordion}
        noTransition={noAccordion}
        accordionShowLabel="Show Create Workflow Form"
        accordionHideLabel="Hide Create Workflow Form"
        status={this.props.status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Fragment>
          {method === 'vCard' &&
            <Components.forms.globalVendorProcedureVCard
              blurAll={this.state.blurAll}
              formKey={this.state.formKey}
              formDelegate={this.state.formDelegate}
              disabled={creating}
            />
          }
          {method === 'ACH' &&
            <Components.forms.globalVendorProcedureACH
              blurAll={this.state.blurAll}
              formKey={this.state.formKey}
              disabled={creating}
              forCreate
            />
          }
          {method === 'check' &&
            <Components.forms.globalVendorProcedureCheck
              blurAll={this.state.blurAll}
              formKey={this.state.formKey}
              disabled={creating}
            />
          }
          {error &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          }
          {this.state.showCreatedNotification &&
            <div className="alert alert-primary" role="alert">
              Workflow successfully created! Please wait while we update the PSOP.
            </div>
          }
          <Components.button
            className="btn btn-primary"
            buttonText="Create"
            onClick={this.submit}
            ariaLabel="Create Workflow"
            updating={creating}
            disabled={disabled}
            onDisabledClick={() => { this.setState({ blurAll: true }); }}
          />
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_globalVendorProcedure);

const INITIAL_FIELDS = {
  vCard: {
    notes: '',
    vCardMaxPerCardAmount: '',
    /**
     * True if vendor won't accept multiple payments of the same amount
     * within a given time frame.
     */
    vCardRequireUniqueAmounts: false,
    vCardDeliveryMethod: 'manual',
    vCardEmails: '',
    vCardCCEmails: '',
    vCardFaxNumbers: '',
    vCardUseFaxTemplate: false,
    vCardUseEmailTemplate: false,
    // vCardPortalUrl: initialData.vCardPortalUrl || '',
    active: true,
  },
  check: {
    notes: '',
    active: true,
    checkUserMustSend: false,
    streetAddress: '',
    unit: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    checkPayeeName: '',
    useVendorName: false,
  },
  ACH: {
    achNotes: '',
    active: true,
    achFirstName: '',
    achLastName: '',
    achEmail: '',
    achRoutingNumber: '',
    achAccountNumber: '',
  },
};

// GENERATOR_TYPE='component';
