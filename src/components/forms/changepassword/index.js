import { connect, Component } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  forms: state.forms,
  access: state.user.access,
  types: state.validations.data.item,
});

const mapDispatchToProps = { ...Store.forms };

// eslint-disable-next-line camelcase
class components_forms_changepassword extends Component {

  state = {
    name: 'Components.forms.changepassword',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const formKey = this.props.formKey || 'default';
    initialize(this.state.name, formKey, {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
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

  checkType = (type, against) => Utils.typesvalidator.validateType(this.props.types, type, against).valid;

  validate = (fields) => {
    const errors = {};

    // validating currentpassword and confirmpassword is unnecessary

    if (fields.newPassword !== fields.confirmPassword) {
      errors.newPassword = 'Passwords do not match';
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!this.checkType('Password', fields.newPassword)) {
      errors.newPassword = 'Must have capital and lowercased letters and be at least 8 characters';
    }

    Object.keys(fields).forEach((fieldKey) => {
      if (fields[fieldKey].length === 0) {
        errors[fieldKey] = 'This field cannot be blank';
      }
    });

    return errors;
  };

  close = (e) => {
    if (typeof this.props.clearAccessErrors === 'function') {
      this.props.clearAccessErrors();
    }
    if (typeof this.props.onClose === 'function') {
      this.props.onClose(e);
    }
  };

  submit = (e) => {
    const form = this.props.forms[this.state.name][this.state.key];
    const data = {
      currentPassword: form.currentPassword.value,
      newPassword: form.newPassword.value,
    };
    this.props.updatePassword(data.currentPassword, data.newPassword)
      .then(() => {
        if (!this.props.access.status.updatingError) {
          this.close(e);
        }
      });
  };

  render() {
    const { form } = this.state;
    if (!form) { return null; }

    const { access } = this.props;

    const { updating } = access.status;

    const isSubmitDisabled = updating
      || !form._allValid
      || form._allInitial;

    return (
      <div className="floating-labels components_forms_changepassword">
        <Components.forms.components.textinput
          form={form}
          type="password"
          field="currentPassword"
          action={this.standardFormAction}
          label="Current Password"
          disabled={updating}
          hideError={!form.currentPassword.touched}
        />
        <Components.forms.components.textinput
          form={form}
          type="password"
          field="newPassword"
          action={this.standardFormAction}
          label="New Password"
          disabled={updating}
          hideError={!form.newPassword.touched}
        />
        <Components.forms.components.textinput
          form={form}
          type="password"
          field="confirmPassword"
          action={this.standardFormAction}
          label="Confirm Password"
          disabled={updating}
          hideError={!form.confirmPassword.touched}
        />
        <Components.button
          onClick={this.submit}
          updating={updating}
          disabled={isSubmitDisabled}
          className="btn btn-primary me-2"
          buttonText="Save"
        />
        <Components.button
          onClick={this.close}
          className="btn btn-secondary me-2"
          buttonText="Cancel"
        />
        {access.status.updatingError && (
          <span className="text-nowrap text-danger mdi mdi-alert-circle small">
            {access.status.updatingError}
          </span>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_changepassword);
