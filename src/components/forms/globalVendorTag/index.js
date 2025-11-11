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
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_globalVendorTag extends Component {

  state = {
    name: 'Components.forms.globalVendorTag',
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData = {},
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, key, {
      name: initialData.name || '',
      description: initialData.description || '',
      aliases: _try(() => initialData.aliases.length) ? initialData.aliases.join(',') : '',
      active: Object.prototype.hasOwnProperty.call(initialData, 'active') ? !!initialData.active : true,
    });

    validate(this.state.name, key, this.validate);
  }
  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

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

  validate = (values) => {
    const tagType = this.props.types.GlobalVendorTag.properties;
    const errors = {};

    if (!this.checkType(tagType.name, values.name)) {
      errors.name = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!this.checkType(tagType.description, values.description)) {
      errors.description = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!values.name) {
      errors.name = 'Tag name is required';
    }

    if (values.aliases && values.aliases.includes(' ')) {
      errors.aliases = 'No spaces between commas or in aliases';
    }

    return errors;
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels components_forms_globalVendorTag pt-2">
        <div className="row">
          <div className="col-xs-12 col-md-10">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="name"
              action={this.standardFormAction}
              label="Tag Name"
              disabled={this.props.disabled}
              hideError={!form.name.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-2">
            <Components.forms.components.switch
              form={form}
              field="active"
              action={this.standardFormAction}
              label="Active"
              disabled={this.props.disabled}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="aliases"
              action={this.standardFormAction}
              label="Aliases"
              detailedInformation="Comma separate multiple aliases, i.e. x,y,z"
              hideError={!form.aliases.touched}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Components.forms.components.textArea
              form={form}
              type="text"
              field="description"
              action={this.standardFormAction}
              label="Description"
              disabled={this.props.disabled}
              hideError={!form.description.touched}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_globalVendorTag);


