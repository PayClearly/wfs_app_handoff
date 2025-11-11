import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_globalVendorProcedureCheck extends Component {

  state = {
    name: 'Components.forms.globalVendorProcedureCheck',
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData = {},
    } = this.props;
    const formKey = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, formKey, {
      notes: initialData.notes || '',
      active: Object.prototype.hasOwnProperty.call(initialData, 'active') ? !!initialData.active : true,
      checkUserMustSend: Object.prototype.hasOwnProperty.call(initialData, 'checkUserMustSend') ? !!initialData.checkUserMustSend : false,
      streetAddress: _try(() => initialData.checkPaymentAddress.streetAddress) || '',
      unit: _try(() => initialData.checkPaymentAddress.unit) || '',
      city: _try(() => initialData.checkPaymentAddress.city) || '',
      state: _try(() => initialData.checkPaymentAddress.state) || '',
      zipCode: _try(() => initialData.checkPaymentAddress.zipCode) || '',
      country: _try(() => initialData.checkPaymentAddress.country) || '',
      checkPayeeName: initialData.checkPayeeName || '',
      useVendorName: _try(() => Object.keys(initialData).length) ? !initialData.checkPayeeName : false,
    });

    validate(this.state.name, formKey, this.validate);
  }
  componentWillReceiveProps(nextProps = {}) {
    const formKey = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, formKey, this.props.forms[this.state.name][formKey]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][formKey],
      formKey,
    });
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.formKey);
  }

  validate = (values) => {
    const errors = {};
    const { types } = this.props;

    if (!values.checkUserMustSend) {
      if (!values.streetAddress) {
        errors.streetAddress = 'Street address is required';
      }

      if (!this.checkType(types.Address.properties.streetAddress, values.streetAddress)) {
        errors.streetAddress = 'Invalid street address';
      }

      if (!this.checkType(types.Address.properties.unit, values.unit)) {
        errors.unit = 'Invalid street address';
      }

      if (!values.city) {
        errors.city = 'City is required';
      }

      if (!this.checkType(types.Address.properties.city, values.city)) {
        errors.city = 'Invalid City';
      }

      if (!values.state) {
        errors.state = 'State is required';
      }

      if (!this.checkType(types.Address.properties.state, values.state) || !/^\w+$/.test(values.state)) {
        errors.state = 'Invalid state';
      }

      if (!values.zipCode) {
        errors.zipCode = 'Zip code is required';
      }

      if (!this.checkType(types.Address.properties.zipCode, values.zipCode) || !/^\d+$/.test(values.zipCode)) {
        errors.zipCode = 'Invalid zip code';
      }

      if (!values.checkPayeeName && !values.useVendorName) {
        errors.checkPayeeName = 'Must provide check payee name or set vendor name as default';
      }
    }

    return errors;
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  standardFormAction = (action, field, value) => {
    const fields = {};
    fields[field] = value;

    if (action === 'change') {
      if (field === 'useVendorName' && value === true) {
        fields.checkPayeeName = '';
      }
      if (field === 'checkPayeeName' && !!value) {
        fields.useVendorName = false;
      }
      this.props[action](this.state.name, this.state.formKey, fields);
      this.props.validate(this.state.name, this.state.formKey, this.validate);
    } else {
      this.props[action](this.state.name, this.state.formKey, field);
    }
  };

  render() {
    const form = this.state.form;
    if (!form) return null;
    const useVendorName = form.useVendorName.value;
    const checkUserMustSend = form.checkUserMustSend.value;

    return (
      <form className="floating-labels components_forms_globalVendorProcedureCheck pt-2">
        <div className={'row'}>
          <div className="col-sm-12">
            <Components.forms.components.textArea
              form={form}
              type="text"
              field="notes"
              action={this.standardFormAction}
              label="Notes"
              disabled={this.props.disabled}
              hideError={!form.notes.touched}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className="col-sm-12">
            <Components.forms.components.checkbox
              form={form}
              field="checkUserMustSend"
              action={this.standardFormAction}
              label={`User Must Send Check (${this.props.providerTheme.displayName} does not handle sending)`}
              disabled={this.props.disabled}
              hideError={!form.checkUserMustSend.touched}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="checkPayeeName"
              action={this.standardFormAction}
              label={(useVendorName) ? 'Payee: Vendor Name' : 'Payee Name'}
              disabled={this.props.disabled || useVendorName}
              hideError={!form.checkPayeeName.touched}
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.checkbox
              form={form}
              field="useVendorName"
              action={this.standardFormAction}
              label="Use Global Vendor as default Payee name"
              disabled={this.props.disabled}
            />
          </div>

        </div>
        <div className={'row'}>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="streetAddress"
              action={this.standardFormAction}
              label="Street Address"
              disabled={this.props.disabled}
              hideError={!form.streetAddress.touched}
              required={!checkUserMustSend}
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="unit"
              action={this.standardFormAction}
              label="Unit / Suite"
              disabled={this.props.disabled}
              hideError={!form.unit.touched}
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
              required={!checkUserMustSend}
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="state"
              action={this.standardFormAction}
              label="State"
              disabled={this.props.disabled}
              hideError={!form.state.touched}
              required={!checkUserMustSend}
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="zipCode"
              action={this.standardFormAction}
              label="Zip Code"
              disabled={this.props.disabled}
              hideError={!form.zipCode.touched}
              required={!checkUserMustSend}
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
              required={!checkUserMustSend}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_globalVendorProcedureCheck);


