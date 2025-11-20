import { connect, Component, bindActionCreators, Fragment } from 'component';
const React = window.React;

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('checksIntegration_idOrganization_idAccount')(state),
    checksIntegration: _try(() => Selectors.integrations(state).checksIntegration, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createCheckAccount: (data) => {
      return dispatch(Store.account.updateIntegration('checksIntegration', { type: 'createAccount', data }));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsIntegration('checksIntegration'));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_integrationcomps_checksIntegration_SMARTPAYABLES_creators_account extends Component {

  state = {
    formName: 'Components.integrationcomps.checksIntegration.SMARTPAYABLES.forms.account',
    formKey: 'create',
  }



  onCreate = () => {
    this.setState(() => {
      return {
        showCreatedNotification: true,
      };
    });
  }

  submit = () => {
    const data = _try(() => this.props.forms[this.state.formName][this.state.formKey]._values, {});
    this.props.createCheckAccount(data);
    this.setState({ showACHAccountCreatedNotification: false });
  }

  render() {
    const { forms } = this.props;
    const status = _try(() => this.props.checksIntegration.status);
    const error = status.updatingError;
    const creating = status.updating;
    const form = _try(() => forms[this.state.formName][this.state.formKey]) || {};
    const disabled = creating || form._allInitial || !form._allValid;

    return (
      <Components.creators.creatorwrapper
        className="components_integrationcomps_checksIntegration_SMARTPAYABLES_creators_account"
        canCreate={this.props.policies.canCreate}
        createFormActive={!this.props.hideCreateForm}
        status={status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Fragment>
          <Components.integrationcomps.checksIntegration.SMARTPAYABLES.forms.account blurAll={this.state.blurAll} disabled={creating} formKey={this.state.formKey} />
          {error &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          }
          {this.state.showACHAccountCreatedNotification &&
            <div className="alert alert-primary" role="alert">
              Check Account application successfully submitted!
            </div>
          }
          <Components.button
            disabled={disabled}
            onClick={this.submit}
            buttonText="Create Check Account"
            updating={creating}
            onDisabledClick={() => { this.setState({ blurAll: true }); }}
          />
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_checksIntegration_SMARTPAYABLES_creators_account);


