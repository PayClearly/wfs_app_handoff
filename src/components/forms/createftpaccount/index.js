import {
  connect, Component,
} from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  forms: state.forms,
  types: state.validations.data.item,
});

const mapDispatchToProps = { ...Store.forms };

class components_forms_createftpaccount extends Component {

  state = {
    name: 'Components.forms.createftpaccount',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, key, {
      username: '',
      password: '',
      verifyPassword: '',
      ipWhitelist: '',
    });
    validate(this.state.name, key, this.validate);
  }

  componentWillReceiveProps(nextProps = {}) {
    const key = nextProps.formKey || 'default';
    this.setState({
      key,
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

  validate = (values) => {
    const errors = {};

    if (values.username.length > 40) {
      errors.username = 'Username must be less than 40 characters';
    }

    if (!values.username.match(/^[a-z0-9_-]+$/)) {
      errors.username = 'Username must match /^[a-z0-9_-]+$';
    }


    if (!values.password || typeof values.password !== 'string') {
      errors.password = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (values.password.length < 10) {
      errors.password = 'Password must be 10 or more characters';
    }

    if (values.password !== values.verifyPassword) {
      errors.verifyPassword = 'Password does not match';
    }

    return errors;
  };

  render() {
    const form = _try(() => this.props.forms[this.state.name][this.state.key], null);
    if (!form) {
      return null;
    }

    return (
      <form className="floating-labels">
        <h3>Account Information</h3>
        <p>The username for this FTP account will be generated upon creation</p>
        <div className="row">
          <div className="col-sm-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="username"
              field="username"
              action={this.standardFormAction}
              label="Username"
              disabled={this.props.disabled}
              hideError={!form.username.touched}
              required
            />
          </div>
          <div className="col-sm-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="password"
              field="password"
              action={this.standardFormAction}
              label="Password"
              disabled={this.props.disabled}
              hideError={!form.password.touched}
              required
            />
          </div>
          <div className="col-sm-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="password"
              field="verifyPassword"
              action={this.standardFormAction}
              label="Verify Password"
              disabled={this.props.disabled}
              hideError={!form.verifyPassword.touched}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col-lg">
            <Components.forms.components.textinput
              form={form}
              type="ipWhitelist"
              field="ipWhitelist"
              action={this.standardFormAction}
              label="IP Address Whitelist, comma separated"
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_createftpaccount);


