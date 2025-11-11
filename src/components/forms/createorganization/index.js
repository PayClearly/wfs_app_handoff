import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    organizations: state.organizations,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_createorganization extends Component {

  state = {
    name: 'Components.forms.createorganization',
    key: 'default',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;

    initialize(this.state.name, 'default', {
      name: '',
      active: false,
    });

    validate(this.state.name, 'default', this.validate);
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || 'default'],
      key: 'default',
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

    if (!this.checkType(this.props.types.Organization.properties.name, fields.name)) {
      errors.name = Utils.typesvalidator.validationErrorMsgs.string;
    }

    Object.keys(fields).forEach((fieldKey) => {
      if (fields[fieldKey].length === 0) {
        errors[fieldKey] = 'This field cannot be blank';
      }
    });

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    const {
      submit,
      organizations,
    } = this.props;

    const creating = organizations.status.creating;
    const createDisabled = creating || !form._allValid;
    const error = organizations.status.creatingError;

    return (
      <div className="floating-labels mt-5">
        <div className="row">
          <div className="col-12 col-md-9">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="name"
              action={this.standardFormAction}
              label="Name"
              disabled={creating}
              hideError={!form.name.touched}
              required
            />
          </div>
          <div className="col-12 col-md-3">
            <Components.forms.components.checkbox
              form={form}
              field="active"
              action={this.standardFormAction}
              label="Active Organization"
              disabled={creating}
            />
          </div>
        </div>
        {error &&
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            Error: {error}
          </div>
        }
        {this.props.showCreatedNotification &&
          <div className="alert alert-primary" role="alert">
            Organization successfully created! View and edit organizations below, or create another organization.
          </div>
        }
        <Components.forms.components.button
          disabled={createDisabled}
          onClick={submit}
          onDisabledClick={this.props.onDisabledClick}
          buttonText="Create"
          updating={creating}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_createorganization);


