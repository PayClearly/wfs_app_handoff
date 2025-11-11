import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

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

const mapDispatchToProps = { ...Store.forms };

class components_forms_welcome extends Component {

  state = {
    name: 'Components.forms.welcome',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const initialFormData = this.props.initialFormData || {};
    const formKey = this.props.formKey || 'default';
    initialize(this.state.name, formKey, {
      password: initialFormData.password || '',
      firstName: initialFormData.firstName || '',
      lastName: initialFormData.lastName || '',
      confirmPassword: initialFormData.confirmPassword || '',
    });
    validate(this.state.name, formKey, this.validate);

  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || 'default'],
      key: nextProps.formKey || 'default',
    });
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
    const errors = {};

    if (!this.checkType('Password', values.password)) {
      errors.password = Utils.typesvalidator.validationErrorMsgs.password;
    }

    if (!values.password) {
      errors.password = 'Password is required';
    }

    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'passwords do not match';
    }

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels" style={{ position: 'relative' }}>
        <Components.forms.components.textinput
          form={form}
          type="text"
          field="firstName"
          action={this.standardFormAction}
          label="First Name"
          disabled={this.props.disabled}
        />
        <Components.forms.components.textinput
          form={form}
          type="text"
          field="lastName"
          action={this.standardFormAction}
          label="Last Name"
          disabled={this.props.disabled}
        />
        <Components.forms.components.textinput
          form={form}
          type="password"
          field="password"
          action={this.standardFormAction}
          label="Password"
          disabled={this.props.disabled}
          hideError={!form.password.touched}
        />
        <Components.forms.components.textinput
          form={form}
          type="password"
          field="confirmPassword"
          action={this.standardFormAction}
          label="Confirm Password"
          disabled={this.props.disabled}
          hideError={!form.confirmPassword.touched}
        />
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_welcome);


