import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    ...bindActionCreators(Store.forms, dispatch),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_integrationcomps_checksIntegration_SMARTPAYABLES_forms_account extends Component {

  state = {
    name: 'Components.integrationcomps.checksIntegration.SMARTPAYABLES.forms.account',
  }

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const initialData = this.props.initialData || {};

    initialize(this.state.name, key, {
      bankName: initialData.bankName || '',
      bankRoutingNumber: initialData.bankRoutingNumber || '',
      bankAccountNumber: initialData.bankAccountNumber || '',
      bankAccountNumberVerify: initialData.bankAccountNumberVerify || '',
      bankFractionalCode: initialData.bankFractionalCode || '',
      nameOnChecks: initialData.nameOnChecks || '',
      checkAddress1: initialData.checkAddress1 || '',
      checkAddress2: initialData.checkAddress2 || '',
      checkCity: initialData.checkCity || '',
      checkStateProvinceRegion: initialData.checkStateProvinceRegion || '',
      checkPostalCode: initialData.checkPostalCode || '',
      signature: initialData.signature || '',
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

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const addressType = this.props.types.Address.properties;
    const errors = {};

    if (typeof values.bankName !== 'string') {
      errors.bankName = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (values.bankName.length < 3 || values.bankName.length > 50) {
      errors.bankName = 'Must be 3 to 50 characters';
    }

    if (/^[0-9]{9}$/.test(values.bankRoutingNumber) !== true) {
      errors.bankRoutingNumber = 'Must be 9 digits';
    }

    if (/^[0-9]{2}-[0-9]{4}\/[0-9]{4}$/.test(values.bankFractionalCode) !== true) {
      errors.bankFractionalCode = 'Must match XX-XXXX/XXXX';
    }

    if (/^[0-9]{3,17}$/.test(values.bankAccountNumber) !== true) {
      errors.bankAccountNumber = 'Must be 3 to 17 digits';
    }

    if (values.bankAccountNumberVerify !== values.bankAccountNumber) {
      errors.bankAccountNumberVerify = 'Account numbers do not match';
    }

    if (values.nameOnChecks.length < 3 || values.nameOnChecks.length > 50) {
      errors.nameOnChecks = 'Must be 3 to 50 characters';
    }

    if (values.checkAddress1.length < 3 || values.checkAddress1.length > 50) {
      errors.checkAddress1 = 'Must be 3 to 50 characters';
    }

    if (values.checkCity.length < 3 || values.checkCity.length > 50) {
      errors.checkCity = 'Must be 3 to 50 characters';
    }

    if (/^[A-Z]{2}$/.test(values.checkStateProvinceRegion) !== true) {
      errors.checkStateProvinceRegion = 'Must be 2 capitalized characters';
    }

    if (/^[0-9]{5}$/.test(values.checkPostalCode) !== true) {
      errors.checkPostalCode = 'Must be 5 digits';
    }

    if (!values.signature.length) {
      errors.signature = 'A signature is required';
    }

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels components_integrationcomps_checksIntegration_SMARTPAYABLES_forms_account">
        <h3>Bank Information</h3>
        <div className="row">
          <div className="col-sm-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="bankName"
              action={this.standardFormAction}
              label="Bank Name"
              disabled={this.props.disabled}
              hideError={!form.bankName.touched}
              required
            />
          </div>
        </div>
        <div className={'row'}>
          <div className="col-sm-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="bankRoutingNumber"
              action={this.standardFormAction}
              label="Routing Number"
              disabled={this.props.disabled}
              hideError={!form.bankRoutingNumber.touched}
              required
            />
          </div>
          <div className={'col-xs-12 col-md-6'} >
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="bankFractionalCode"
              action={this.standardFormAction}
              label="Fractional Code"
              disabled={this.props.disabled}
              hideError={!form.bankFractionalCode.touched}
              required
            />
          </div>
          <div className="col-sm-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="password"
              field="bankAccountNumber"
              action={this.standardFormAction}
              label="Account Number"
              disabled={this.props.disabled}
              hideError={!form.bankAccountNumber.touched}
              required
            />
          </div>
          <div className="col-sm-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="password"
              field="bankAccountNumberVerify"
              action={this.standardFormAction}
              label="Verify Account Number"
              disabled={this.props.disabled}
              hideError={!form.bankAccountNumberVerify.touched}
              required
            />
          </div>
        </div>
        <h3>Check Information</h3>
        <p>The name and address to be printed on the checks.</p>
        <div className={'row'}>
          <div className={'col-xs-12 col-md-6'} >
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="nameOnChecks"
              action={this.standardFormAction}
              label="Name on Checks"
              disabled={this.props.disabled}
              hideError={!form.nameOnChecks.touched}
              required
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col-xs-12 col-md-6'} >
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="checkAddress1"
              action={this.standardFormAction}
              label="Address Line 1"
              disabled={this.props.disabled}
              hideError={!form.checkAddress1.touched}
              required
            />
          </div>
          <div className={'col-xs-12 col-md-6'} >
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="checkAddress2"
              action={this.standardFormAction}
              label="Address Line 2"
              disabled={this.props.disabled}
              hideError={!form.checkAddress2.touched}
            />
          </div>
          <div className={'col-xs-12 col-md-4'} >
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="checkCity"
              action={this.standardFormAction}
              label="City"
              disabled={this.props.disabled}
              hideError={!form.checkCity.touched}
              required
            />
          </div>
          <div className={'col-xs-12 col-md-4'} >
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="checkStateProvinceRegion"
              action={this.standardFormAction}
              label="State / Province / Region"
              disabled={this.props.disabled}
              hideError={!form.checkStateProvinceRegion.touched}
              required
            />
          </div>
          <div className={'col-xs-12 col-md-4'} >
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="checkPostalCode"
              action={this.standardFormAction}
              label="Check Postal Code"
              disabled={this.props.disabled}
              hideError={!form.checkPostalCode.touched}
              required
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col-12'} >
            <div style={{ height: 150, 'margin-bottom': 70 }}>
              <Components.forms.components.signature
                field="signature"
                form={form}
                action={this.standardFormAction}
                hideError={!form.signature.touched}
                label={'Check Signature'}
                required
              />
            </div>
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_checksIntegration_SMARTPAYABLES_forms_account);


