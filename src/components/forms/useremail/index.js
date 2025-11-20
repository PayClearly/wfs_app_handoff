import {
  connect, Component,
} from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Components from 'components';


const mapStateToProps = (state) => ({
  forms: state.forms,
  types: state.validations.data.item,
});

const mapDispatchToProps = { ...Store.forms };

class components_forms_useremail extends Component {

  state = {
    name: 'Components.forms.useremail',
  };

  componentDidMount() {
    const { initialize, validate, initialFormData = {} } = this.props;
    const key = this.props.formKey || 'default';

    initialize(this.state.name, key, {
      email: initialFormData.email || '',
      firstName: '',
      lastName: '',
    });
    validate(this.state.name, key, this.validate);
  }

  componentWillReceiveProps(nextProps = {}) {
    const key = nextProps.formKey || 'default';

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, key, this.props.forms[this.state.name][key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
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

  checkType = (type, against) => Utils.typesvalidator.validateType(this.props.types, type, against).valid;

  validate = (values) => {
    const errors = {};

    if (!this.checkType(this.props.types.User.properties.email, values.email)) {
      errors.email = Utils.typesvalidator.validationErrorMsgs.email;
    }

    if (!values.email) {
      errors.email = 'Email address is required';
    }

    return errors;
  };

  render() {
    const { form } = this.state;
    if (!form) {
      return <div />;
    }

    return (
      <form className="floating-labels" onSubmit={(e) => e.preventDefault()}>
        <div className="row">
          <div className="col-sm">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="email"
              action={this.standardFormAction}
              label="Email"
              disabled={this.props.disabled}
              hideError={!form.email.touched}
              required
            />
          </div>
        </div>
        {this.props.showAddtionalOptions
          && (
            <Components.forms.components.accordion>
              <div className="row pt-4">
                <div className="col-xs-12 col-md-4">
                  <Components.forms.components.textinput
                    form={form}
                    type="text"
                    field="firstName"
                    action={this.standardFormAction}
                    label="First Name"
                    disabled={this.props.disabled}
                    hideError={!form.firstName.touched}
                  />
                </div>
                <div className="col-xs-12 col-md-4">
                  <Components.forms.components.textinput
                    form={form}
                    type="text"
                    field="lastName"
                    action={this.standardFormAction}
                    label="Last Name"
                    disabled={this.props.disabled}
                    hideError={!form.lastName.touched}
                  />
                </div>
              </div>
            </Components.forms.components.accordion>
          )}
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_useremail);
