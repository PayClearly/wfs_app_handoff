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

class components_forms_resetpassword extends Component {

  state = {
    name: 'Components.forms.resetpassword',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const initialFormData = this.props.initialFormData || {};
    const formKey = this.props.formKey || 'default';
    initialize(this.state.name, formKey, {
      password: initialFormData.password || '',
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
      errors.password = 'must have capital and lowercased letters and be at least 8 characters';
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
          type="password"
          field="password"
          action={this.standardFormAction}
          label={this.props.firstFieldText || 'Choose a New Password'}
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

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_resetpassword);

