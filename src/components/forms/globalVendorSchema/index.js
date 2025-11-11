import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
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

class components_forms_globalVendorSchema extends Component {

  state = {
    name: 'Components.forms.globalVendorSchema',
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      initialFormData = {},
    } = this.props;
    const formKey = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, formKey, {
      name: initialFormData.name || '',
      active: Object.prototype.hasOwnProperty.call(initialFormData, 'active') ? !!initialFormData.active : true,
      customFieldsReset: false,
    });
    validate(this.state.name, formKey, this.validate);

    const initialCustomFields = _try(() => initialFormData.customFields) || {};
    this.setState({
      customFields: Object.values(initialCustomFields)
        .reduce((acc, field) => {
          acc[`${formKey}_${field.name}`] = field;
          return acc;
        }, {}),
      formKey,
    });
  }

  componentWillReceiveProps(nextProps = {}) {
    const formKey = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, formKey, this.props.forms[this.state.name][formKey]._values);
    }

    if (!this.props.resetCustomForms && nextProps.resetCustomForms) {
      this.setState({
        customFields: {},
      });
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][formKey],
      formKey,
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.formKey);
  }

  handleAddCustomField = () => {
    const customFields = JSON.parse(JSON.stringify(this.state.customFields));
    const now = Date.now();
    customFields[`${this.state.formKey}_${now}`] = { _id: `${this.state.formKey}_${now}` };
    this.setState({
      customFields,
    });
  };

  validate = (values) => {
    const errors = {};

    if (!values.name.length) {
      errors.name = 'Name is required';
    }

    return errors;
  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.formKey, field, value);
      this.props.validate(this.state.name, this.state.formKey, this.validate);
    } else {
      this.props[action](this.state.name, this.state.formKey, field);
    }
  };

  renderCustomFields = () => {
    return Object.keys(this.state.customFields).map((key) => {
      const currentValue = this.state.customFields[key];
      return (
        <div className="row">
          <div className="col-12">
            <Components.forms.createcustomfield
              formKey={key}
              fieldName={currentValue.name || ''}
              fieldType={currentValue.fieldType || ''}
              isFieldRequired={currentValue.required}
              options={currentValue.options || ''}
            />
          </div>
        </div>
      );
    });
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels components_forms_globalVendorSchema pt-2">
        <div className={'row'}>
          <div className={'col-sm-12 col-md-9'}>
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="name"
              action={this.standardFormAction}
              label="Name"
              hideError={!form.name.touched}
              required
            />
          </div>
          <div className={'col-sm-12 col-md-3'}>
            <Components.forms.components.switch
              form={form}
              type="text"
              field="active"
              action={this.standardFormAction}
              label="Active"
              hideError={!form.active.touched}
              required
            />
          </div>
          {form._values.name &&
            <div className="col-12">
              <form className="floating-labels" onSubmit={(e) => { e.preventDefault(); }}>
                {this.renderCustomFields()}
                <div className="row">
                  <div className="col-12">
                    <Components.button
                      disabled={this.props.disabled}
                      onClick={this.handleAddCustomField}
                      buttonText="Add New Custom Field"
                      className="btn btn-outline-primary w-100 mb-4"
                      icon="pe-1 mdi mdi-plus-circle"
                    />
                  </div>
                </div>
              </form>
            </div>
          }
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_globalVendorSchema);


