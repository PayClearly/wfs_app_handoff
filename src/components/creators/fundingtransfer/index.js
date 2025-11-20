import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    achTransfersStatus: state.account.achTransfers.status,
    policies: Selectors.entity('achTransfers_idOrganization_idAccount')(state),
    forms: state.forms,
    fundingDetails: Selectors.funding(state),
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
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
  });
};

class components_creators_fundingtransfer extends Component {
  state = {
    createFormActive: true,
    showCreatedNotification: false,
    formKey: 'create',
  };




  onCreate = () => {
    this.props.resetForm('Components.forms.fundingtransfer', this.state.formKey, {
      amount: '',
      fundingSource: '',
      note: '',
    });
    this.setState({ showCreatedNotification: true });
  }

  onDisabledClick = () => {
    this.setState({ blurAll: true });
  }

  onCreateClick = () => {
    if (this.props.onCreateClick && typeof this.props.onCreateClick === 'function') this.props.onCreateClick();
    this.createTransfer();
  }

  createTransfer = () => {
    const form = (this.props.forms['Components.forms.fundingtransfer'] && this.props.forms['Components.forms.fundingtransfer'][this.state.formKey]) || {};

    const data = { ...form._values };

    if (this.props.forManualDepositRelease && _try(() => this.props.fundingDetails.earmarkEnforced)) {
      data._forPayments = _try(() => this.props.fundingDetails.unfundedPayments);
      data._forPaymentCardChangeRequests = _try(() => this.props.fundingDetails.unfundedPaymentCardChangeRequests);
    }

    this.props.createAchTransfer(data);
    this.setState({ showCreatedNotification: false });
  }

  render() {
    const { achTransfersStatus } = this.props;

    const error = achTransfersStatus.creatingError;
    const creating = achTransfersStatus.creating;
    const form = (this.props.forms['Components.forms.fundingtransfer'] && this.props.forms['Components.forms.fundingtransfer'][this.state.formKey]) || {};
    const disabled = creating || !form._allValid;

    return (
      <Components.creators.creatorwrapper
        canCreate={this.props.policies.canCreate}
        createFormActive={this.state.createFormActive}
        status={achTransfersStatus}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        {this.props.noAccordion ?
          <Fragment>
            <Components.forms.fundingtransfer
              formKey={this.state.formKey}
              blurAll={this.state.blurAll}
              disabled={creating}
              initialData={this.props.forManualDepositRelease ? { amount: this.props.fundingDetails.currentTransferPool } : undefined}
              forManualDepositRelease={this.props.forManualDepositRelease}
              withdrawal={this.props.withdrawal}
            />
            {error &&
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Something Went Wrong</h4>
                Error: {error}
              </div>
            }
            {this.state.showCreatedNotification &&
              <div className="alert alert-primary" role="alert">
                Transfer successfully created! See details in Funding history, or create another transfer.
              </div>
            }
            <Components.button
              buttonText="Create Transfer"
              onClick={this.onCreateClick}
              onDisabledClick={this.onDisabledClick}
              ariaLabel="Create a ACH Transfer"
              className="btn btn-primary"
              disabled={disabled}
              updating={creating}
            />
          </Fragment>
          :
          <Components.forms.components.accordion
            showLabel="Show Create Transfer Form"
            hideLabel="Hide Create Transfer Form"
          >
            <Components.forms.fundingtransfer
              formKey={this.state.formKey}
              blurAll={this.state.blurAll}
              disabled={creating}
              initialData={this.props.forManualDepositRelease ? { amount: this.props.fundingDetails.currentTransferPool } : undefined}
              forManualDepositRelease={this.props.forManualDepositRelease}
              withdrawal={this.props.withdrawal}
            />
            {error &&
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Something Went Wrong</h4>
                Error: {error}
              </div>
            }
            {this.state.showCreatedNotification &&
              <div className="alert alert-primary" role="alert">
                Transfer successfully created! See details in Funding history, or create another transfer.
              </div>
            }
            <Components.button
              buttonText="Create Transfer"
              onClick={this.onCreateClick}
              onDisabledClick={this.onDisabledClick}
              ariaLabel="Create a ACH Transfer"
              className="btn btn-primary mt-4"
              disabled={disabled}
              updating={creating}
            />
          </Components.forms.components.accordion>
        }
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_fundingtransfer);


