import { connect, Component, bindActionCreators, Fragment } from 'component';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
    kyc: _try(() => state.account.kyc, {}),
    providerTheme: Selectors.providerTheme(state),
  });
};


const mapDispatchToProps = (dispatch, props) => {
  return ({
    destroy: (name, key) => {
      dispatch(Store.forms.destroy(name, key));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    validate: (name, key, validate) => {
      dispatch(Store.forms.validate(name, key, validate));
    },
    initialize: (name, key, fields) => {
      dispatch(Store.forms.initialize(name, key, fields));
    },
    focus: (name, key, fieldName) => {
      dispatch(Store.forms.focus(name, key, fieldName));
    },
    blur: (name, key, fieldData) => {
      dispatch(Store.forms.blur(name, key, fieldData));
    },
    change: (name, key, fieldData, newValue) => {
      dispatch(Store.forms.change(name, key, fieldData, newValue));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsIntegration('cardsIntegration'));
    },
    retrieveCustomerEnrollment: (id) => {
      dispatch(Store.account.retrieveCustomerEnrollment(id));
    },
    clearFetchedCustomer: () => {
      dispatch(Store.account.clearFetchedCustomerEnrollment());
    },
  });
};

class components_integrationcomps_cardsIntegration_GALILEO_forms_customerUpdate extends Component {

  state = {
    name: 'Components.integrationcomps.cardsIntegration.GALILEO.forms.customerUpdate',
    fetching: true,
  };

  componentDidMount() {
    const { retrieveCustomerEnrollment } = this.props;
    retrieveCustomerEnrollment(this.props.id);
    if (this.props.providerId) console.log(this.props.providerId);
  }
  componentWillReceiveProps(nextProps) {
    const { initialize, validate } = this.props;
    if (this.props.kyc.status.fetching && !nextProps.kyc.status.fetching && nextProps.kyc.data.items.fetchedCustomer) {
      this.setState({ fetching: false });
      const formKey = this.props.formKey || 'default';
      const customerData = nextProps.kyc.data.items.fetchedCustomer;
      const data = {
        firstName: customerData.firstName || '',
        lastName: customerData.lastName || '',
        dateOfBirth: '',
        address1: customerData.address1 || '',
        address2: customerData.address2 || '',
        city: customerData.city || '',
        state: customerData.state || '',
        postalCode: customerData.postalCode || '',
        countryCode: customerData.countryCode || '840',
        email: '',
        ssn: '',
      };
      initialize(this.state.name, formKey, data);
      validate(this.state.name, formKey, this.validate);
      this.setState({ key: formKey });
    }
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || 'default'],
      key: nextProps.formKey || 'default',
    });
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  checkType = (type, against) => {
    const a = Utils.typesvalidator.validateType(this.props.types, type, against).valid;
    return a;
  };

  validate = (fields) => {
    const errors = {};

    if (fields.firstName) {
      if (fields.firstName.length < 1 || fields.firstName.length > 40) errors.firstName = 'Must be between 1 and 40 characters';
      if (_includesSpecialCharacters(fields.firstName)) errors.firstName = 'Must not include special characters (.,?@&!#~*;+)';
    }
    if (fields.lastName) {
      if (fields.lastName.length < 2 || fields.lastName.length > 40) errors.lastName = 'Must be between 2 and 40 characters';
      if (_includesSpecialCharacters(fields.lastName)) errors.lastName = 'Must not include special characters (.,?@&!#~*;+)';
    }
    if (fields.address1) {

      // Maximum length -- 40 characters. Cannot be a P.O. Box.
      // Any string that starts with APO, PO, APOB, POB, post office, call box, or gpobox and is followed by numbers or box. Street names that start with apo or po are not detected, e.g., Apollo street, Polar street.
      // These elements do not affect the result:
        // Leading, trailing, or in-between white-space characters such as space, tab, or enter
        // A dot . between the letters A, P, and O, e.g., A.P.O or P.O.
        // The case — Validation is case-insensitive.
      const text = fields.address1.replace((/(\.)?(\s)?/gi), '');
      if ((/^(A*)PO(B*)([0-9]|box)/i).test(text) || (/^postoffice([0-9]|box)/i).test(text) || (/^callbox([0-9]|box)/i).test(text) || (/^gpobox([0-9]|box)/i).test(text)) errors.address1 = 'Address cannot be a PO Box';
    }
    if (fields.address2 && fields.address2.length > 30) errors.address2 = 'Must not exceed 30 characters';
    if (fields.city && (_includesNumbers(fields.city) || _includesSpecialCharacters(fields.city))) errors.city = 'Must not include numbers or special characters (.,?@&!#~*;+)';
    if (fields.state && fields.state.length !== 2) errors.state = 'Must be 2 character state abbreviation';
    if (fields.countryCode && fields.countryCode.length !== 3) errors.countryCode = 'Must be 3 digit ISO numeric UN M49 country code; Example USA=840, Canada=124.';
    if (fields.postalCode && !(/^([0-9]{5})-([0-9]{4})$/.test(fields.postalCode) || /^[0-9]{5}$/.test(fields.postalCode))) {
      errors.postalCode = 'Must be of format XXXXX or XXXXX-XXXX';
    }
    if (fields.dateOfBirth && !/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.test(fields.dateOfBirth)) {
      errors.dateOfBirth = 'Must be of format YYYY-MM-DD';
    }
    if (fields.email && !this.checkType('EmailAddress', fields.email)) {
      errors.email = Utils.typesvalidator.validationErrorMsgs.email;
    }
    if (fields.ssn && !/^[0-9]{9}$/.test(fields.ssn)) {
      errors.ssn = 'Must be of format XXXXXXXXX';
    }

    return errors;
  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  render() {
    const form = this.state.form;
    if (this.state.fetching) return <div style={{ height: '100px' }}><Components.horizontalLoader /></div>;
    if (!form) {
      return (
        <div className="alert alert-danger" role="alert">
          There has been an error! Please contact our support team at <strong>{this.props.providerTheme.supportPhone}</strong> or <a href={`mailto:${this.props.providerTheme.supportEmail}`}><strong>{this.props.providerTheme.supportEmail}</strong></a>.
        </div>
      );
    }
    return (
      <form className="floating-labels mt-4">
        <div className={'row'}>
          <div className={'col-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              field="firstName"
              action={this.standardFormAction}
              label="First Name"
              required={this.props.creator}
              hideError={!form.firstName.touched}
              disabled={this.props.updating}
            />
          </div>
          <div className={'col-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              field="lastName"
              action={this.standardFormAction}
              label="Last Name"
              required={this.props.creator}
              hideError={!form.lastName.touched}
              disabled={this.props.updating}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              field="dateOfBirth"
              action={this.standardFormAction}
              label="Date of Birth"
              required={this.props.creator}
              hideError={!form.dateOfBirth.touched}
              disabled={this.props.updating}
            />
          </div>
          <div className={'col-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              field="address1"
              action={this.standardFormAction}
              label="Address 1"
              required={this.props.creator}
              hideError={!form.address1.touched}
              disabled={this.props.updating}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              field="city"
              action={this.standardFormAction}
              label="City"
              required={this.props.creator}
              hideError={!form.city.touched}
              disabled={this.props.updating}
            />
          </div>
          <div className={'col-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              field="address2"
              action={this.standardFormAction}
              label="Address 2"
              hideError={!form.address2.touched}
              disabled={this.props.updating}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              field="state"
              action={this.standardFormAction}
              label="State"
              required={this.props.creator}
              hideError={!form.state.touched}
              disabled={this.props.updating}
            />
          </div>
          <div className={'col-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              field="postalCode"
              action={this.standardFormAction}
              label="Postal Code"
              required={this.props.creator}
              hideError={!form.postalCode.touched}
              disabled={this.props.updating}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              field="countryCode"
              action={this.standardFormAction}
              label="Country Code"
              required={this.props.creator}
              hideError={!form.countryCode.touched}
              disabled={this.props.updating}
            />
          </div>
          <div className={'col-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              field="email"
              action={this.standardFormAction}
              label="Email"
              required={this.props.creator}
              hideError={!form.email.touched}
              disabled={this.props.updating}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              field="ssn"
              action={this.standardFormAction}
              label="SSN"
              required={this.props.creator}
              hideError={!form.ssn.touched}
              disabled={this.props.updating}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_cardsIntegration_GALILEO_forms_customerUpdate);

// Internal Helper Functions ...

function _includesSpecialCharacters(string) {
  return (/([.,?@&!#~*;+])/.test(string));
}
function _includesNumbers(string) {
  return (/([1-9])/.test(string));
}

