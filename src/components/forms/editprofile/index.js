import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import resolvePath from 'object-resolve-path';

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    access: state.user.access,
    profile: state.user.profile,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };


class components_forms_editprofile extends Component {

  state = {
    name: 'Components.forms.editprofile',
  };

  componentDidMount() {
    const { initialize, validate, profile } = this.props;
    const formKey = this.props.formKey || 'default';
    initialize(this.state.name, formKey, {
      firstName: resolvePath(profile, 'data.item.firstName') || '',
      lastName: resolvePath(profile, 'data.item.lastName') || '',
      email: resolvePath(profile, 'data.item.email') || '',
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
    const userTypes = this.props.types.User;
    const errors = {};

    if (!this.checkType(userTypes.properties.firstName, fields.firstName)) {
      errors.firstName = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!this.checkType(userTypes.properties.lastName, fields.lastName)) {
      errors.lastName = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!this.checkType(userTypes.properties.email, fields.email)) {
      errors.email = Utils.typesvalidator.validationErrorMsgs.email;
    }

    Object.keys(fields).forEach((fieldKey) => {
      if ((fields[fieldKey] || '').length === 0) {
        errors[fieldKey] = 'This field cannot be blank';
      }
    });

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels components_forms_editprofile">
        <Components.forms.components.textinput
          form={form}
          type="text"
          field="firstName"
          action={this.standardFormAction}
          label="First Name"
          hideError={!form.firstName.touched}
          disabled={this.props.updating}
          required
        />
        <Components.forms.components.textinput
          form={form}
          type="text"
          field="lastName"
          action={this.standardFormAction}
          label="Last Name"
          hideError={!form.lastName.touched}
          disabled={this.props.updating}
          required
        />
        <Components.forms.components.textinput
          form={form}
          type="text"
          field="email"
          action={this.standardFormAction}
          label="Email"
          hideError={!form.email.touched}
          disabled={this.props.updating}
          required
        />
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_editprofile);


