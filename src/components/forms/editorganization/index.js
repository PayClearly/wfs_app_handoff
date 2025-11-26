import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    organizations: state.organizations,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_editorganization extends Component {

  state = {
    name: 'Components.forms.editorganization',
  };

  componentDidMount() {
    const { initialize, validate, initialFormData } = this.props;
    initialize(this.state.name, initialFormData._id, {
      name: initialFormData.name,
      active: initialFormData.active,
    });
    validate(this.state.name, initialFormData._id, this.validate);
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, nextProps.initialFormData._id, this.props.forms[this.state.name][nextProps.initialFormData._id]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.initialFormData._id],
      key: nextProps.initialFormData._id,
    });

    if (this.props.initialFormData !== nextProps.initialFormData) {
      this.props.destroy(this.state.name, this.state.key);
      this.props.initialize(this.state.name, nextProps.initialFormData._id, {
        name: nextProps.initialFormData.name,
        active: nextProps.initialFormData.active,
      });
    }
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
    const organizationTypes = this.props.types.Organization;
    const errors = {};

    if (!this.checkType(organizationTypes.properties.name, fields.name)) {
      errors.name = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!this.checkType(organizationTypes.properties.active, fields.active)) {
      errors.active = Utils.typesvalidator.validationErrorMsgs.boolean;
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

    return (
      <form className="floating-labels">
        <Components.forms.components.textinput
          form={form}
          type="text"
          field="name"
          action={this.standardFormAction}
          label="Organization Name"
          disabled={this.props.updating}
          required
        />
        <Components.forms.components.checkbox
          form={form}
          field="active"
          action={this.standardFormAction}
          label="Active Organization"
          disabled={this.props.updating}
        />
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_editorganization);

