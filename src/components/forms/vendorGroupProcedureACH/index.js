import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Components from 'components';

const mapStateToProps = (state) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
    paymentProcedures: state.global.paymentProcedures.data.items,
  });
};

class components_forms_vendorGroupProcedureACH extends Component {

  state = {
    name: 'Components.forms.vendorGroupProcedureACH',
  };

  componentDidMount() {
    const {
      validate,
      initialData = {},
      initialize,
    } = this.props;
    const formKey = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    const initialPaymentProcedures = this.props.paymentProcedures[initialData.credentialSchema] || {};

    initialize(this.state.name, formKey, {
      achNotes: initialPaymentProcedures.achNotes || '',
      achFirstName: initialPaymentProcedures.achFirstName || '',
      achLastName: initialPaymentProcedures.achLastName || '',
      achEmail: initialPaymentProcedures.achEmail || '',
      achRoutingNumber: initialPaymentProcedures.achRoutingNumber || '',
      achAccountNumber: initialPaymentProcedures.achAccountNumber || '',
    });
    validate(this.state.name, formKey, this.validate);

    // hack to give data to parent
    this.props.formDelegate.getFormState = () => {
      return {
        procedures: {
          achNotes: this.state.form.achNotes.value,
          achFirstName: this.state.form.achFirstName.value,
          achLastName: this.state.form.achLastName.value,
          achEmail: this.state.form.achEmail.value,
          achRoutingNumber: this.state.form.achRoutingNumber.value,
          achAccountNumber: this.state.form.achAccountNumber.value,
        },
      };
    };
    this.setState({
      formKey,
    });
  }

  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, key, this.props.forms[this.state.name][key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  validate = (values) => {
    const errors = {};

    if (!values.achFirstName) {
      errors.achFirstName = 'Account holder first name is required';
    }

    if (!values.achLastName) {
      errors.achLastName = 'Account holder last name is required';
    }

    if (!values.achEmail) {
      errors.achEmail = 'Account email is required';
    }

    if (!values.achRoutingNumber) {
      errors.achRoutingNumber = 'Bank routing number is required';
    }

    // Only enforce ACH account number requirement if in create form
    if (!values.achAccountNumber && this.state.formKey === 'creator') {
      errors.achAccountNumber = 'Bank account number is required';
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
    if (!form) return null;

    return (
      <div className="components_forms_vendorGroupProcedureACH">
        <div className={'row'}>
          <div className="col-sm-12">
            <Components.forms.components.textArea
              form={form}
              type="text"
              field="achNotes"
              action={this.standardFormAction}
              label="Notes"
              disabled={this.props.disabled}
              hideError={!form.achNotes.touched}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className="col-sm-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="achFirstName"
              action={this.standardFormAction}
              label="First Name"
              disabled={this.props.disabled}
              hideError={!form.achFirstName.touched}
              required
            />
          </div>
          <div className="col-sm-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="achLastName"
              action={this.standardFormAction}
              label="Last Name"
              disabled={this.props.disabled}
              hideError={!form.achLastName.touched}
              required
            />
          </div>
          <div className="col-sm-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="achEmail"
              action={this.standardFormAction}
              label="Email Address"
              disabled={this.props.disabled}
              hideError={!form.achEmail.touched}
              required
            />
          </div>
        </div>
        <div className={'row'}>
          <div className="col-sm-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="achRoutingNumber"
              action={this.standardFormAction}
              label="Routing Number"
              disabled={this.props.disabled}
              hideError={!form.achRoutingNumber.touched}
              required
            />
          </div>
          <div className="col-sm-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="achAccountNumber"
              action={this.standardFormAction}
              label="Account Number"
              disabled={this.props.disabled}
              hideError={!form.achAccountNumber.touched}
              required={this.state.formKey === 'creator'}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, { ...Store.forms })(components_forms_vendorGroupProcedureACH);


