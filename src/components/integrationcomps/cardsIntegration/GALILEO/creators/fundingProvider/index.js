import { connect, Component, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('cardsIntegration_idOrganization_idAccount')(state),
    status: state.account.cardsIntegration.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    setFundingProvider: (fundingProvider) => {
      return dispatch(Store.account.updateIntegration('cardsIntegration', { type: 'setFundingProvider', fundingProvider }));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsIntegration('cardsIntegration'));
    },
  });
};

class components_integrationcomps_cardsIntegration_GALILEO_creators_fundingProvider extends Component {
  state = {
    formKey: 'fundingProvider',
  };





  submit = () => {
    const form = (this.props.forms['Components.integrationcomps.cardsIntegration.GALILEO.forms.fundingProvider'] && this.props.forms['Components.integrationcomps.cardsIntegration.GALILEO.forms.fundingProvider'][this.state.formKey] || {});
    const formData = form._values;
    const { fundingProvider } = formData;

    this.props.setFundingProvider(fundingProvider);
  };

  render() {
    if (!this.props.status.fetched) return null;

    const { status } = this.props;

    const error = status.creatingError || status.updatingError;
    const { creating } = status;
    const { updating } = status;
    const disabled = updating || creating;

    return (
      <Components.creators.creatorwrapper
        canCreate={this.props.policies.canCreate}
        createFormActive
        status={this.props.status}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <div className="card">
          <div className="card-header">
            <h2 className="text-primary mb-0">Funding Provider</h2>
          </div>
          <div className="card-body">
            <Components.integrationcomps.cardsIntegration.GALILEO.forms.fundingProvider
              provider={this.props.provider}
              formKey={this.state.formKey}
              blurAll={this.state.blurAll}
              disabled={updating}
            />
            {error &&
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Something Went Wrong</h4>
                Error: {error}
              </div>}
            <Components.button
              style={{ marginTop: '2rem' }}
              disabled={disabled}
              onClick={this.submit}
              buttonText="Submit Funding Provider"
              updating={updating}
              onDisabledClick={() => { this.setState({ blurAll: true }); }}
            />
          </div>
        </div>

      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_cardsIntegration_GALILEO_creators_fundingProvider);


