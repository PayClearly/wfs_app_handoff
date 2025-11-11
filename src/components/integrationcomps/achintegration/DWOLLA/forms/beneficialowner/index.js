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

class components_integrationcomps_achintegration_DWOLLA_forms_beneficialowner extends Component {

  state = {
    name: 'Components.integrationcomps.achintegration.DWOLLA.forms.beneficialowner',
  };

  componentDidMount() {
    const {
      firstName,
      lastName,
      address1,
      address2,
      city,
      stateProvinceRegion,
      country,
      postalCode,
      dateOfBirth,
      ssn,
      initialize,
      validate,
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, key, {
      firstName: firstName || '',
      lastName: lastName || '',
      address1: address1 || '',
      address2: address2 || '',
      city: city || '',
      stateProvinceRegion: stateProvinceRegion || '',
      country: country || 'US',
      postalCode: postalCode || '',
      dateOfBirth: dateOfBirth || '',
      ssn: ssn || '',
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

    const isDOB18orMoreYearsOld = (year, month, day) => {
      return new Date(parseInt(year, 10) + 18, month - 1, day) <= new Date();
    };

    if (values.dateOfBirth) {
      if (values.dateOfBirth.length !== 10) {
        errors.dateOfBirth = 'Must use the correct format (yyyy-mm-dd)';
      } else {
        const pattern = /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/;
        if (!pattern.test(values.dateOfBirth)) {
          errors.dateOfBirth = 'Must use the correct format (yyyy-mm-dd)';
        } else {
          const dob = values.dateOfBirth;
          const data = dob.split('-');
          const year = data[0];
          const month = data[1];
          const day = data[2];
          // using ISO 8601 Date String
          if (isNaN(Date.parse(`${month}/${day}/${year}`))) {
            errors.dateOfBirth = 'This is not a valid date';
          } else if (!isDOB18orMoreYearsOld(year, month, day)) {
            errors.dateOfBirth = 'Must be 18 years or older';
          }
        }
      }
    }

    const stateIsValid = (state) => {
      if (state.length !== 2) return false;

      if (state !== state.toUpperCase()) {
        return false;
      }

      return true;
    };

    if (values.stateProvinceRegion && !stateIsValid(values.stateProvinceRegion)) {
      errors.stateProvinceRegion = 'Must be a valid two-letter US state or territory code';
    }

    if (values.postalCode && !/^\d{5}$/.test(values.postalCode)) {
      errors.postalCode = 'Must be a valid 5-digit postal code';
    }

    if (values.ssn && !/^[0-9]{9}$/.test(values.ssn)) {
      errors.ssn = 'Must be full 9 digit SSN, e.g. 123456789';
    }

    Object.keys(values).forEach((value) => {
      if (value === 'address2') return;

      if (!values[value]) {
        errors[value] = 'This field is required';
      }
    });

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
    if (!form) return null;

    return (
      <form className="floating-labels">
        <h3>Beneficial Owner Information</h3>
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="firstName"
              action={this.standardFormAction}
              label="First Name"
              disabled={this.props.disabled}
              hideError={!form.firstName.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="lastName"
              action={this.standardFormAction}
              label="Last Name"
              disabled={this.props.disabled}
              hideError={!form.lastName.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.maskedinput
              form={form}
              type="text"
              mask={[/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
              maskPlaceholder="YYYY-MM-DD"
              field="dateOfBirth"
              action={this.standardFormAction}
              label="Date of Birth"
              disabled={this.props.disabled}
              required
              hideError={!form.dateOfBirth.touched}
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="password"
              field="ssn"
              action={this.standardFormAction}
              label="SSN"
              disabled={this.props.disabled}
              hideError={!form.ssn.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="address1"
              action={this.standardFormAction}
              label="Street Address"
              disabled={this.props.disabled}
              hideError={!form.address1.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="address2"
              action={this.standardFormAction}
              label="Unit / Suite"
              disabled={this.props.disabled}
              hideError={!form.address2.touched}
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="city"
              action={this.standardFormAction}
              label="City"
              disabled={this.props.disabled}
              hideError={!form.city.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="stateProvinceRegion"
              action={this.standardFormAction}
              label="State / Providence / Region"
              disabled={this.props.disabled}
              hideError={!form.stateProvinceRegion.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="postalCode"
              action={this.standardFormAction}
              label="Postal Code"
              disabled={this.props.disabled}
              hideError={!form.postalCode.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="country"
              action={this.standardFormAction}
              label="Country"
              disabled={this.props.disabled}
              hideError={!form.country.touched}
              required
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_forms_beneficialowner);


