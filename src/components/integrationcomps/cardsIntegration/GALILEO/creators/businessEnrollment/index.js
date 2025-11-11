import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('cardsIntegration_idOrganization_idAccount')(state),
    cardsIntegration: _try(() => Selectors.integrations(state).cardsIntegration, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createBusinessEnrollment: (data) => {
      return dispatch(Store.account.createBusinessEnrollment({ providerName: props.provider, ...data }));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsIntegration('cardsIntegration'));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_integrationcomps_cardsIntegration_GALILEO_creators_businessEnrollment extends Component {

  state = {
    formName: 'Components.integrationcomps.cardsIntegration.GALILEO.forms.businessEnrollment',
    formKey: 'create',
  };



  onCreate = () => {
    this.setState(() => {
      return {
        showCreatedNotification: true,
      };
    });
  };

  submit = () => {
    const data = _try(() => this.props.forms[this.state.formName][this.state.formKey]._values, {});
    this.props.createBusinessEnrollment(data);
    this.setState({ showBusinessEnrollmentCreatedNotification: false });
  };

  render() {
    const { forms } = this.props;
    const status = _try(() => this.props.cardsIntegration.status);
    const error = status.updatingError;
    const creating = status.updating;
    const form = _try(() => forms[this.state.formName][this.state.formKey]) || {};
    const disabled = creating || form._allInitial || !form._allValid;

    return (
      <Components.creators.creatorwrapper
        className="components_integrationcomps_cardsIntegration_GALILEO_creators_businessEnrollment"
        canCreate={this.props.policies.canCreate}
        createFormActive={!this.props.hideCreateForm}
        status={status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Fragment>
          <Components.integrationcomps.cardsIntegration.GALILEO.forms.businessEnrollment blurAll={this.state.blurAll} disabled={creating} formKey={this.state.formKey} />
          {error &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          }
          {this.state.showBusinessEnrollmentCreatedNotification &&
            <div className="alert alert-primary" role="alert">
              Business was successfully verified!
            </div>
          }
          <Components.button
            disabled={disabled}
            onClick={this.submit}
            buttonText="Create Business Enrollment"
            updating={creating}
            onDisabledClick={() => { this.setState({ blurAll: true }); }}
          />
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_cardsIntegration_GALILEO_creators_businessEnrollment);


