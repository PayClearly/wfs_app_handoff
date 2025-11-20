import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_login extends Component {

  state = {
    name: 'Components.forms.login',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const initialFormData = this.props.initialFormData || {};
    const formKey = this.props.formKey || 'default';
    initialize(this.state.name, formKey, {
      email: initialFormData.email || '',
      password: initialFormData.password || '',
    });
    validate(this.state.name, formKey, this.validate);

    this.setState({ key: formKey });
  }
  componentWillReceiveProps(nextProps) {
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

  validate = (fields) => {
    const errors = {};

    if (this.props.types.User && !this.checkType(this.props.types.User.properties.email, fields.email)) {
      errors.email = Utils.typesvalidator.validationErrorMsgs.email;
    }

    Object.keys(fields).forEach((fieldKey) => {
      if (fields[fieldKey].length === 0) {
        errors[fieldKey] = 'This field is required.';
      }
    });

    return errors;
  };

  render() {
    const { form } = this.state;
    if (!form) return null;

    return (
      <form className="floating-labels" onSubmit={this.props.onSubmit}>
        <Components.forms.components.textinput
          form={form}
          type="text"
          field="email"
          action={this.standardFormAction}
          label="Email"
          disabled={this.props.updating || this.props.disableEmail}
          required
          hideError={!form.email.touched}
        />
        <Components.forms.components.textinput
          form={form}
          type="password"
          field="password"
          action={this.standardFormAction}
          label="Password"
          disabled={this.props.updating}
          required
          hideError={!form.password.touched}
        />
        {/* Conditionally render invisible input so enter keypress can trigger onSubmit function prop */}
        {this.props.onSubmit && <input type="submit" style={{ visibility: 'hidden' }} />}
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_login);


