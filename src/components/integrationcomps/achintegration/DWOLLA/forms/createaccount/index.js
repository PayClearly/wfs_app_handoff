import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_integrationcomps_achintegration_DWOLLA_forms_createaccount extends Component {

  state = {
    name: 'Components.integrationcomps.achintegration.DWOLLA.forms.createaccount',
    businessTypePaymentOptions: {
      corporation: {
        display: 'Corporation',
      },
      llc: {
        display: 'LLC',
      },
      partnership: {
        display: 'Partnership',
      },
      soleProprietorship: {
        display: 'Sole Proprietorship',
      },
    },
  };

  componentDidMount() {
    const {
      adminFirstName,
      type,
      adminLastName,
      adminEmail,
      controllerFirstName,
      controllerLastName,
      controllerTitle,
      controllerDOB,
      controllerSSN,
      controllerAddress1,
      controllerAddress2,
      controllerCity,
      controllerState,
      controllerPostalCode,
      controllerCountry,
      businessAddress1,
      businessAddress2,
      businessCity,
      businessState,
      businessPostalCode,
      businessName,
      businessType,
      businessClassificationCategory,
      businessClassification,
      businessEIN,
      initialize,
      validate,
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, key, {
      adminFirstName: adminFirstName || '',
      type: type || 'business',
      adminLastName: adminLastName || '',
      adminEmail: adminEmail || '',
      controllerFirstName: controllerFirstName || '',
      controllerLastName: controllerLastName || '',
      controllerTitle: controllerTitle || '',
      controllerSSN: controllerSSN || '',
      controllerDOB: controllerDOB || '',
      controllerAddress1: controllerAddress1 || '',
      controllerAddress2: controllerAddress2 || '',
      controllerCity: controllerCity || '',
      controllerState: controllerState || '',
      controllerPostalCode: controllerPostalCode || '',
      controllerCountry: controllerCountry || 'US',
      businessAddress1: businessAddress1 || '',
      businessAddress2: businessAddress2 || '',
      businessCity: businessCity || '',
      businessState: businessState || '',
      businessPostalCode: businessPostalCode || '',
      businessName: businessName || '',
      businessType: businessType || '',
      businessClassificationCategory: businessClassificationCategory || '',
      businessClassification: businessClassification || '',
      businessEIN: businessEIN || '',
    });
    validate(this.state.name, key, this.validate);
  }
  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const errors = {};

    // if (values.adminEmail && !this.checkType('EmailAddress', values.adminEmail)) {
    //   errors.adminEmail = Utils.typesvalidator.validationErrorMsgs.email;
    // }

    if (values.controllerDOB) {
      if (values.controllerDOB.length !== 10) {
        errors.controllerDOB = 'Must use the correct format (yyyy-mm-dd)';
      } else {
        const pattern = /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/;
        if (!pattern.test(values.controllerDOB)) {
          errors.controllerDOB = 'Must use the correct format (yyyy-mm-dd)';
        } else {
          const dob = values.controllerDOB;
          const data = dob.split('-');
          // using ISO 8601 Date String
          if (isNaN(Date.parse(`${data[1]}/${data[2]}/${data[0]}`))) {
            errors.controllerDOB = 'This is not a valid date';
          }
        }
      }
    }

    if (!this.props.retry && values.controllerSSN && !/^[0-9]{4}$/.test(values.controllerSSN)) {
      errors.controllerSSN = 'Must be 4 digits';
    }

    if (this.props.retry && values.controllerSSN && !/^[0-9]{9}$/.test(values.controllerSSN)) {
      errors.controllerSSN = 'Must be full 9 digit SSN, e.g. 123456789';
    }

    const stateIsValid = (state) => {
      if (state.length !== 2) return false;

      if (state !== state.toUpperCase()) {
        return false;
      }

      return true;
    };

    if (values.controllerState && !stateIsValid(values.controllerState)) {
      errors.controllerState = 'Must be a valid two-letter US state or territory code';
    }
    if (values.businessState && !stateIsValid(values.businessState)) {
      errors.businessState = 'Must be a valid two-letter US state or territory code';
    }

    const postalCodeIsValid = (zip) => {
      return /^\d{5}(-\d{4})?$/.test(zip);
    };

    if (values.controllerPostalCode && !postalCodeIsValid(values.controllerPostalCode)) {
      errors.controllerPostalCode = 'Must be a valid postal code';
    }
    if (values.businessPostalCode && !postalCodeIsValid(values.businessPostalCode)) {
      errors.businessPostalCode = 'Must be a valid postal code';
    }

    if (values.businessEIN && !/^\d{2}-\d{7}$/.test(values.businessEIN)) {
      errors.businessEIN = 'Must be a valid EIN, e.g. 12-3456789';
    }

    Object.keys(values).forEach((value) => {
      if (value === 'controllerAddress2' || value === 'businessAddress2') return;
      if (value === 'businessEIN' && values.businessType === 'soleProprietorship') return;

      if (!values[value]) {
        errors[value] = 'This field is required';
      }
    });

    return errors;
  };

  standardFormAction = (action, field, value) => {
    const fields = {};
    fields[field] = value;

    if (action === 'change') {
      if (field === 'businessClassificationCategory') {
        fields.businessClassification = '';
      }

      this.props[action](this.state.name, this.state.key, fields);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels components_integrationcomps_achintegration_DWOLLA_forms_createaccount">
        <h3>Account Admin Information</h3>
        <div className="row">
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="adminFirstName"
              action={this.standardFormAction}
              label="First Name"
              disabled={this.props.disabled}
              hideError={!form.adminFirstName.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="adminLastName"
              action={this.standardFormAction}
              label="Last Name"
              disabled={this.props.disabled}
              hideError={!form.adminLastName.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="adminEmail"
              action={this.standardFormAction}
              label="Email"
              disabled={this.props.disabled}
              hideError={!form.adminEmail.touched}
              required
            />
          </div>
        </div>
        <h3>Controller Information</h3>
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="controllerFirstName"
              action={this.standardFormAction}
              label="First Name"
              disabled={this.props.disabled}
              hideError={!form.controllerFirstName.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="controllerLastName"
              action={this.standardFormAction}
              label="Last Name"
              disabled={this.props.disabled}
              hideError={!form.controllerLastName.touched}
              required
            />
          </div>
        </div>
        <div className={'row'}>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="controllerTitle"
              action={this.standardFormAction}
              label="Title"
              disabled={this.props.disabled}
              hideError={!form.controllerTitle.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.maskedinput
              form={form}
              type="text"
              mask={[/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
              maskPlaceholder="YYYY-MM-DD"
              field="controllerDOB"
              action={this.standardFormAction}
              label="Date of Birth"
              disabled={this.props.disabled}
              required
              hideError={!form.controllerDOB.touched}
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="password"
              field="controllerSSN"
              action={this.standardFormAction}
              label={this.props.retry ? 'Full SSN' : 'Last 4 digits of SSN'}
              disabled={this.props.disabled}
              hideError={!form.controllerSSN.touched}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="controllerAddress1"
              action={this.standardFormAction}
              label="Street Address"
              disabled={this.props.disabled}
              hideError={!form.controllerAddress1.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="controllerAddress2"
              action={this.standardFormAction}
              label="Apt, Floor, Suite, Bldg. #"
              disabled={this.props.disabled}
              hideError={!form.controllerAddress2.touched}
            />
          </div>
          <div className="col-xs-12 col-md-5">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="controllerCity"
              action={this.standardFormAction}
              label="City"
              disabled={this.props.disabled}
              hideError={!form.controllerCity.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-3">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="controllerState"
              action={this.standardFormAction}
              label="State"
              disabled={this.props.disabled}
              hideError={!form.controllerState.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-2">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="controllerPostalCode"
              action={this.standardFormAction}
              label="Postal Code"
              disabled={this.props.disabled}
              hideError={!form.controllerPostalCode.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-2">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="controllerCountry"
              action={this.standardFormAction}
              label="Country"
              disabled={this.props.disabled}
              hideError={!form.controllerCountry.touched}
              required
            />
          </div>
        </div>
        <h3>Business Information</h3>
        <div className={'row'}>
          <div className={'col-xs-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="businessName"
              action={this.standardFormAction}
              label="Business Name"
              disabled={this.props.disabled}
              hideError={!form.businessName.touched}
              required
            />
          </div>
          <div className={'col-xs-12 col-md-6'}>
            <Components.forms.components.selectinput
              form={form}
              field="businessType"
              action={this.standardFormAction}
              label="Business Type"
              options={this.state.businessTypePaymentOptions}
              disabled={this.props.disabled}
              hideError={!form.businessType.touched}
              required
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col-xs-12 col-md-4'}>
            <Components.forms.components.selectinput
              form={form}
              field="businessClassificationCategory"
              action={this.standardFormAction}
              label="Business Classification Category"
              options={this.props.businessClassificationsOptions}
              disabled={this.props.disabled}
              hideError={!form.businessClassification.touched}
              required
            />
          </div>
          <div className={'col-xs-12 col-md-4'}>
            <Components.forms.components.selectinput
              form={form}
              field="businessClassification"
              action={this.standardFormAction}
              label="Business Classification"
              options={this.props.businessClassificationsOptions[form._values.businessClassificationCategory] && this.props.businessClassificationsOptions[form._values.businessClassificationCategory].subOptions}
              disabled={this.props.disabled || !form.businessClassificationCategory.value}
              hideError={!form.businessClassification.touched}
              placeholder={!form.businessClassificationCategory.value ? 'Select a category first' : ''}
              required
            />
          </div>
          <div className={'col-xs-12 col-md-4'}>
            <Components.forms.components.maskedinput
              form={form}
              type="text"
              mask={[/\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/]}
              field="businessEIN"
              action={this.standardFormAction}
              label="EIN"
              disabled={this.props.disabled}
              hideError={!form.businessEIN.touched}
              required={form.businessType.value !== 'soleProprietorship'}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="businessAddress1"
              action={this.standardFormAction}
              label="Street Address"
              disabled={this.props.disabled}
              hideError={!form.businessAddress1.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="businessAddress2"
              action={this.standardFormAction}
              label="Apt, Floor, Suite, Bldg. #"
              disabled={this.props.disabled}
              hideError={!form.businessAddress2.touched}
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="businessCity"
              action={this.standardFormAction}
              label="City"
              disabled={this.props.disabled}
              hideError={!form.businessCity.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-2">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="businessState"
              action={this.standardFormAction}
              label="State"
              disabled={this.props.disabled}
              hideError={!form.businessState.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-2">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="businessPostalCode"
              action={this.standardFormAction}
              label="Postal Code"
              disabled={this.props.disabled}
              hideError={!form.businessPostalCode.touched}
              required
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_forms_createaccount);


