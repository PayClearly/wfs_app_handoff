import {
  connect, Component, bindActionCreators,
} from 'component';

import Store from 'store';
import Components from 'components';

const mapStateToProps = (state) => ({
  forms: state.forms,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(Store.forms, dispatch),
});

const mapResourcesToProps = () => ({});

class components_forms_sftpAccountDetails extends Component {

  state = {
    name: 'Components.forms.sftpAccountDetails',
  };

  componentDidMount() {
    const {
      initialize,
      initialData = {},
    } = this.props;
    const key = this.props.formKey;
    this.setState({ key });

    initialize(this.state.name, key, {
      newPassword: '',
      confirmPassword: '',
      ipWhitelist: ((initialData.fileMage && initialData.fileMage.whitelist) || []).join(', '),
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState((prevState) => ({
      form: nextProps.forms[prevState.name] && nextProps.forms[prevState.name][prevState.key || 'default'],
      key: nextProps.formKey || 'default',
    }));
  }

  validateFormInputs = (values) => {
    const errors = {};

    if (typeof values.newPassword !== 'string') {
      errors.newPassword = 'Password must be alphanumeric characters';
    }
    if (values.newPassword && values.newPassword.length < 10) {
      errors.newPassword = 'Password must be 10 or more characters';
    }

    if (values.newPassword && values.confirmPassword && values.confirmPassword !== values.newPassword) {
      errors.confirmPassword = 'Password does not match';
    }

    return errors;
  };


  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.props.id || 'default', field, value);
      this.props.validate(this.state.name, this.state.key, this.validateFormInputs);
    } else {
      this.props[action](this.state.name, this.props.id || 'default', field);
    }
  };

  render() {
    const { form } = this.state;
    if (!form) { return null; }
    return (
      <div className="floating-labels components_forms_sftpAccountDetails">
        <div className="row">
          <div className="col-sm">
            <Components.forms.components.textinput
              form={form}
              type="password"
              field="newPassword"
              action={this.standardFormAction}
              label="New Password"
              disabled={this.props.disabled}
              hideError={!form.newPassword.touched}
            />
          </div>
          <div className="col-sm">
            <Components.forms.components.textinput
              form={form}
              type="password"
              field="confirmPassword"
              action={this.standardFormAction}
              label="Confirm Password"
            />
          </div>
          <div className="col-sm">
            <Components.forms.components.textinput
              form={form}
              type="ipWhitelist"
              field="ipWhitelist"
              action={this.standardFormAction}
              label="IP Addresses Whitelist, comma separated"
              disabled={this.props.disabled}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_sftpAccountDetails);


