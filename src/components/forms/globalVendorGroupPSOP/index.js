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
    schemas: state.global.schemas.data.items,
    credentialSchemas: state.global.credentialSchemas,
    schemasCollections: state.global.schemas.collections,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_globalVendorGroupPSOP extends Component {

  state = {
    name: 'Components.forms.globalVendorGroupPSOP',
    acceptedFiles: [],
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData = {},
      schemas,
      credentialSchemas,
    } = this.props;
    const formKey = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    const credentialSchemaName = _try(() => credentialSchemas.data.items[credentialSchemas.collections._ids[initialData.credentialSchema][0]].name);
    const paymentSchemaName = _try(() => schemas[initialData.paymentSchema].name);

    const formData = {
      credentialSchema: initialData.credentialSchema || '',
      credentialSchemaName: credentialSchemaName || '',
      paymentSchema: initialData.paymentSchema || '',
      paymentSchemaName: paymentSchemaName || '',
      fee: Boolean(initialData.fee) || false,
      feeType: _try(() => initialData.fee.type) || '',
      feeValue: _try(() => initialData.fee.value) || '',
      accepts: Object.prototype.hasOwnProperty.call(initialData, 'accepts') ? !!initialData.accepts : true,
    };

    initialize(this.state.name, formKey, formData);

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

    if (values.credentialSchemaName && !values.credentialSchema) {
      errors.credentialSchemaName = 'Must be a valid credential schema or empty';
    }

    if (values.paymentSchemaName && !values.paymentSchema) {
      errors.paymentSchemaName = 'Must be a valid payment schema or empty';
    }

    if (values.fee) {
      if (!values.feeType) {
        errors.feeType = 'Fee Type is required';
      }
      if (values.feeType === 'percentage' && (values.feeValue > 100 || values.feeValue <= 0)) {
        errors.feeValue = 'Fee percentage must be between 0 and 100';
      }
      if (values.feeType === 'fixed' && values.feeValue <= 0) {
        errors.feeValue = 'Fee dollar amount must be greater than $0';
      }
      if (!values.feeValue) {
        errors.feeValue = 'This field is required';
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
      if (field === 'credentialSchemaName') {
        fields.credentialSchema = _try(() => this.props.credentialSchemas.data.items[this.props.credentialSchemas.collections.names[value][0]]._id, undefined);
      }
      if (field === 'paymentSchemaName') {
        fields.paymentSchema = _try(() => this.props.schemas[this.props.schemasCollections.names[value][0]]._id, undefined);
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

    return (
      <form className="floating-labels components_forms_globalVendorGroupPSOP pt-2">
        <div className={'row'}>
          <div className="col-12 col-md-5">
            <Components.forms.components.typeahead
              form={form}
              type="text"
              field="credentialSchemaName"
              action={this.standardFormAction}
              label="Credential Schema"
              options={_try(() => Object.values(this.props.credentialSchemas.data.items)) || {}}
              labelKey="name"
              noItemsText="None Found"
              hideError={!form.credentialSchemaName.touched}
              disabled={this.props.disabled}
            />
          </div>
          <div className="col-12 col-md-5">
            <Components.forms.components.typeahead
              form={form}
              type="text"
              field="paymentSchemaName"
              action={this.standardFormAction}
              label="Payment Schema"
              options={_try(() => Object.values(this.props.schemas)) || {}}
              labelKey="name"
              noItemsText="None Found"
              hideError={!form.paymentSchemaName.touched}
              disabled={this.props.disabled}
            />
          </div>
          <div className="col-12 col-md-2">
            <Components.forms.components.switch
              form={form}
              field="accepts"
              action={this.standardFormAction}
              label="Accepts"
              disabled={this.props.disabled}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12 mb-1">
            <Components.forms.components.checkbox
              form={form}
              field="fee"
              action={this.standardFormAction}
              label={`This group charges a fee for ${this.props.method} Payments`}
            />
          </div>
          { form.fee.value &&
            <Fragment>
              <div className="col-xs-12 col-md-6">
                <Components.forms.components.selectinput
                  form={form}
                  field="feeType"
                  action={this.standardFormAction}
                  label="Fee Type"
                  options={FEE_TYPE_OPTIONS}
                  placeholder={FEE_TYPE_OPTIONS[form.feeType.value] && FEE_TYPE_OPTIONS[form.feeType.value].display || ''}
                  required={form.fee.value}
                  disabled={!form.fee.value}
                  hideError={!form.feeType.touched}
                />
              </div>
              <div className="col-xs-12 col-md-6">
                <Components.forms.components.textinput
                  form={form}
                  type="number"
                  field="feeValue"
                  action={this.standardFormAction}
                  label={(() => {
                    let modifier;
                    if (form.feeType.value) {
                      modifier = form.feeType.value === 'fixed' ? 'Dollar Amount' : 'Percentage';
                    }
                    return `Fee ${modifier || 'Value'}`;
                  })()}
                  required={form.fee.value}
                  disabled={!form.fee.value}
                  hideError={!form.feeValue.touched}
                  detailedInformation={(() => {
                    if (!form.feeType.value) return null;
                    return form.feeType.value === 'percentage' ? 'Use whole numbers to represent percentages, e.g., 50 is 50%, and 2.5 is 2.5%' : '';
                  })()}
                />
              </div>
            </Fragment>
          }
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_globalVendorGroupPSOP);

// Internal Helper Functions ... 
const FEE_TYPE_OPTIONS = {
  fixed: {
    display: 'Fixed',
  },
  percentage: {
    display: 'Percentage',
  },
};

// GENERATOR_TYPE='component';
