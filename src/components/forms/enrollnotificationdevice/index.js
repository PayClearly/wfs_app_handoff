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
    notificationDeviceStatus: state.user.twoFactorAuth.status,
    userInfo: state.user.profile.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_enrollnotificationdevice extends Component {

  state = {
    name: 'Components.forms.enrollnotificationdevice',
    notificationOptions: {
      sms: {
        display: 'SMS',
      },
      // },
    },
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const formKey = this.props.formKey || 'default';
    initialize(this.state.name, formKey, {
      email: this.props.userInfo.email,
      notificationMethodType: 'sms',
      phone: '',
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

    if (fields.notificationMethodType === 'email' && !this.checkType(this.props.types.User.properties.email, fields.email)) {
      errors.email = Utils.typesvalidator.validationErrorMsgs.email;
    }

    if (fields.notificationMethodType === 'sms' && !this.checkType('PhoneNumber', fields.phone)) {
      errors.phone = Utils.typesvalidator.validationErrorMsgs.phoneNumber;
    }

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels components_forms_enrollnotificationdevice" onSubmit={e => e.preventDefault()}>
        <p className="mb-4">Select your preferred notification method.</p>
        <Components.forms.components.selectinput
          form={form}
          field="notificationMethodType"
          action={this.standardFormAction}
          label="Notification Methods"
          options={this.state.notificationOptions}
          disabled={this.props.disabled}
          hideError={!form.notificationMethodType.touched}
          placeholder={!form.notificationMethodType.value.length ? 'Select a two factor auth method' : ''}
          required
        />
        {form.notificationMethodType.value === 'sms' ? (
          <Components.forms.components.maskedinput
            form={form}
            type="tel"
            field="phone"
            mask={['1', '-', /[1-9]/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
            maskPlaceholder="1-555-555-5555"
            action={this.standardFormAction}
            label="Phone Number"
            disabled={this.props.updating}
            required
            hideError={!form.phone.touched}
          />
        ) : (
          <Components.forms.components.textinput
            form={form}
            type="email"
            field="email"
            action={this.standardFormAction}
            label="Email"
            disabled={this.props.updating}
            required
            hideError={!form.email.touched}
          />
        )}
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_enrollnotificationdevice);


