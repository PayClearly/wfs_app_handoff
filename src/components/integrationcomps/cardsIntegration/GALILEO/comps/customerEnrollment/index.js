import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    cardsIntegration: _try(() => Selectors.integrations(state).cardsIntegration, {}),
    kyc: _try(() => state.account.kyc),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createCustomerEnrollment: (data) => {
      return dispatch(Store.account.createCustomerEnrollment({ providerName: props.provider, ...data }));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsIntegration('cardsIntegration'));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    declareUBOExemption: () => {
      return dispatch(Store.account.updateIntegration('cardsIntegration', { type: 'declareUBOExemption' }))
    }
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_integrationcomps_cardsIntegration_GALILEO_comps_customerEnrollment extends Component {

  state = {
    formName: 'Components.integrationcomps.cardsIntegration.GALILEO.forms.customerEnrollment',
  }



  componentWillUnmount() {
    this.props.clearStatusErrors();
  }

  render() {
    const { customers } = this.props.kyc.data.items;
    const updating = _try(() => this.props.cardsIntegration.status.updating);
    const error = _try(() => this.props.cardsIntegration.status.updatingError) || this.state.error;
    const submitDisabled = !Object.values(customers).every(val => val.status === 'pass');
    return (
      <div className="components_integrationcomps_cardsIntegration_GALILEO_comps_customerEnrollment">
        <Fragment>
          <div className="row">
            <div className="col-12">
              <div className="alert alert-primary" role="alert">
                <h4 className="alert-heading">Enroll Users</h4>
                <p className="m-0">
                  Please enter the necessary information to enroll users.
                </p>
              </div>
            </div>
          </div>
          <Components.integrationcomps.cardsIntegration.GALILEO.creators.customerEnrollment
            provider={this.props.provider}
            blurAll={this.state.formBlurAll} hideCreateForm={this.props.forms[this.state.formName] && this.props.forms[this.state.formName].default} />
          <Components.tables.customerEnrollments providerName="GALILEO" updateFormName="Components.integrationcomps.cardsIntegration.GALILEO.forms.customerUpdate" updateFormKey="default">
            <Components.integrationcomps.cardsIntegration.GALILEO.forms.customerUpdate status={this.props.kyc.status} blurAll={this.state.blurAll} disabled={this.props.kyc.status.creating} formKey={this.state.formKey} />
          </Components.tables.customerEnrollments>
          {error &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          }
          <Components.button
            disabled={submitDisabled}
            updating={updating}
            onClick={() => {
              this.setState({ error: false });
              this.props.clearStatusErrors();
              this.props.passStep();
            }}
            onDisabledClick={() => { this.setState({ formBlurAll: true }); }}
            buttonText="Continue to ACH Enrollment"
          />
          <Components.button
            className='skip-enrollment-button btn btn-primary'
            disabled={submitDisabled}
            updating={updating}
            onClick={() => {
              this.props.declareUBOExemption();
            }}
            onDisabledClick={() => { this.setState({ formBlurAll: true }); }}
            buttonText="Skip Enrollment For UBO Exempt Customers"
          />
        </Fragment>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_cardsIntegration_GALILEO_comps_customerEnrollment);


