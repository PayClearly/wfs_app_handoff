import { connect, Component, bindActionCreators, Fragment } from 'component';
const React = window.React;

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('cardsIntegration_idOrganization_idAccount')(state),
    cardsIntegration: _try(() => Selectors.integrations(state).cardsIntegration, {}),
    kyc: _try(() => state.account.kyc, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createCustomerEnrollment: (userData) => {
      const data = { providerName: props.provider, ...userData };
      return dispatch(Store.account.createCustomerEnrollment(data));
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

class components_integrationcomps_cardsIntegration_GALILEO_creators_customerEnrollment extends Component {

  state = {
    formName: 'Components.integrationcomps.cardsIntegration.GALILEO.forms.customerEnrollment',
    formKey: 'customerEnrollment',
    editBtnText: 'Edit User',
  }

  componentDidMount() {
    this.setState({
      blurAll: this.props.blurAll,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.kyc.status.creating && nextProps.kyc.status.created && !this.props.forms[this.state.formName][this.state.formKey]._allInitial) {
      this.props.resetForm(this.state.formName, this.state.formKey, {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        countryCode: '840', // Three digit ISO numeric UN M49 country code; Example USA=840,
        email: '', // not needed for CIP, but useful for searching for unique customer
        ssn: '',
      });
    }
  }


  onCreate = () => {
    this.setState(() => {
      return {
        showCreatedNotification: true,
      };
    });
  }

  submit = async () => {
    const data = _try(() => this.props.forms[this.state.formName][this.state.formKey]._values, {});
    this.props.createCustomerEnrollment(data);
    this.setState({ showCustomerEnrollmentCreatedNotification: false });
  }

  render() {
    const { forms } = this.props;
    const status = _try(() => this.props.kyc.status);
    const error = status.creatingError;
    const creating = status.creating;
    const form = _try(() => forms[this.state.formName][this.state.formKey]) || {};
    const disabled = creating || form._allInitial || !form._allValid;
    if (!this.state.formKey) return null;
    // Hide createForm when we have 5 users already registered
    return (
      <Components.creators.creatorwrapper
        className="components_integrationcomps_cardsIntegration_GALILEO_creators_customerEnrollment"
        canCreate={this.props.policies.canCreate}
        createFormActive={!this.props.hideCreateForm}
        status={status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Fragment>
          <hr />
          {error &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          }
          {this.state.showcustomerEnrollmentCreatedNotification &&
            <div className="alert alert-primary" role="alert">
              Customer was successfully enrolled!
            </div>
          }
          <Components.integrationcomps.cardsIntegration.GALILEO.forms.customerEnrollment status={status} blurAll={this.state.blurAll} disabled={creating} formKey={this.state.formKey} />
          <Components.button
            disabled={disabled}
            onClick={this.submit}
            buttonText="Enroll User"
            updating={creating}
            onDisabledClick={() => { this.setState({ blurAll: true }); }}
          />
          <hr />
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_cardsIntegration_GALILEO_creators_customerEnrollment);


