import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
import Components from 'components';

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

class components_forms_cardsIntegration_GALILEO extends Component {

  state = {
    name: 'Components.forms.cardsIntegration.GALILEO',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = this.props.formKey || 'default';

    initialize(this.state.name, key, {
      firstName: this.props.initialFormData.firstName || '',
      lastName: this.props.initialFormData.lastName || '',
      email: this.props.initialFormData.email || '',
      id: this.props.initialFormData.id || '',
      accountNumber: this.props.initialFormData.accountNumber || '',
      routingNumber: this.props.initialFormData.routingNumber || '',
      name: this.props.initialFormData.name || '',
      type: this.props.initialFormData.type || '',
    });
    validate(this.state.name, key, this.validate);
  }

  componentWillReceiveProps(nextProps = {}) {
    const key = nextProps.formKey || 'default';
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  validate = (values) => {
    const errors = {};

    if (values.email && !this.checkType('EmailAddress', values.email)) {
      errors.email = Utils.typesvalidator.validationErrorMsgs.email;
    }

    if (values.name && values.name.toLowerCase() !== values.name) errors.name = 'Must not include capital letters';
    if (values.name && /\s/g.test(values.name)) errors.name = 'Must not include whitespace (space, tab, etc.)';

    Object.keys(values).forEach((value) => {
      if (!values[value]) errors[value] = 'Field is required';
    });
    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    const bankTypeOptions = {
      checking: {
        display: 'Checking',
      },
      savings: {
        display: 'Savings',
      },
    };

    return (
      <div className="components_forms_cardsIntegration_GALILEO">
        <form className="floating-labels">
          <strong>Account Info</strong>
          <br />
          <br />
          <div className="row">
            <div className="col-sm">
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
            <div className="col-sm">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="email"
                action={this.standardFormAction}
                label="Email Address"
                disabled={this.props.disabled}
                hideError={!form.email.touched}
                required
              />
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="id"
                action={this.standardFormAction}
                label="Reference Number"
                disabled={this.props.disabled}
                hideError={!form.id.touched}
                required
              />
            </div>
          </div>

          <strong>Banking Info</strong>
          <br />
          <br />
          <div className="row">

            <div className="col-sm">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="name"
                action={this.standardFormAction}
                label="Name"
                disabled={this.props.disabled}
                hideError={!form.name.touched}
                detailedInformation="Bank name must be lowercase and have no spaces"
                required
              />
              <Components.forms.components.selectinput
                form={form}
                action={this.standardFormAction}
                label="Type"
                field="type"
                options={bankTypeOptions}
                placeholder={form._values.type || '-'}
                disabled={this.props.disabled}
                hideError={!form.type.touched}
                required
              />
            </div>
            <div className="col-sm">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="accountNumber"
                action={this.standardFormAction}
                label="Account Number"
                disabled={this.props.disabled}
                hideError={!form.accountNumber.touched}
                required
              />
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="routingNumber"
                action={this.standardFormAction}
                label="Routing Number"
                disabled={this.props.disabled}
                hideError={!form.routingNumber.touched}
                required
              />
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_cardsIntegration_GALILEO);


