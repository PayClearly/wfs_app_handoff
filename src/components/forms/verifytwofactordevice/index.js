import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import classNames from 'classnames';

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
    privateMetadata: state.user.privateMetadata.data.item,
    twoFactorAuthStatus: state.user.twoFactorAuth.status,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_verifytwofactordevice extends Component {

  state = {
    name: 'Components.forms.verifytwofactordevice',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const formKey = this.props.formKey || 'default';
    initialize(this.state.name, formKey, {
      token: '',
      rememberMe: false,
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

    if (!/^[0-9]{6}$/.test(fields.token)) {
      errors.token = 'Must be six digits';
    }

    return errors;
  };

  render() {
    const { form } = this.state;
    if (!form) return null;

    return (
      <form className="floating-labels" onSubmit={this.props.onSubmit}>
        <div className={'row justify-content-center'}>
          <div className={'col-8'}>
            <Components.forms.components.textinput
              form={form}
              field="token"
              action={this.standardFormAction}
              label="Enter Code"
              required
              hideError={!form.token.touched}
              disabled={this.props.updating}
            />
          </div>
          {
            !this.props.hideRememberMe &&
            <div className={'col-4 text-center'}>
              <Components.forms.components.switch
                form={form}
                field="rememberMe"
                action={this.standardFormAction}
                label="Remember Me"
                disabled={this.props.updating}
              />
            </div>
          }
        </div>
        {this.props.twoFactorAuthStatus.updatingError &&
          <div className={classNames('alert', 'alert-danger')} role="alert">
            {this.props.twoFactorAuthStatus.updatingError}
          </div>
        }
        {this.props.onSubmit && <input type="submit" style={{ visibility: 'hidden' }} />}
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_verifytwofactordevice);


