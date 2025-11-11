import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import { Menu, MenuItem } from 'react-bootstrap-typeahead';

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

const fieldTypeOptions = {
  string: {
    display: 'String',
  },
  number: {
    display: 'Number',
  },
  options: {
    display: 'Options',
  },
  date: {
    display: 'Date',
  },
  static: {
    display: 'Static',
  },
};

class components_forms_createcustomfield extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: 'Components.forms.createcustomfield',
      optionsSelected: false,
      staticSelected: false,
      selected: props.options && props.options.split(',') || undefined,
      currentInput: [],
    };
  }

  componentDidMount() {
    const {
      initialize,
      validate,
      fieldName,
      fieldType,
      isFieldRequired,
      options,
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, key, {
      fieldName: fieldName || '',
      fieldType: fieldType || 'string',
      isFieldRequired: isFieldRequired === false ? isFieldRequired : true,
      options: options || '',
      hiddenOptions: options,
    });
    validate(this.state.name, key, this.validate);
  }
  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const form = nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key];
    const hiddenOptions = '';

    this.setState({
      form,
      key,
      optionsSelected: form && form.fieldType.value === 'options',
      staticSelected: form && form.fieldType.value === 'static',
      hiddenOptions,
    });
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  onTypeAheadChange = (value) => {
    this.props.change(this.state.name, this.state.key, 'hiddenOptions', value.join(','));
    return this.setState({
      options: value,
    });
  };

  standardFormAction = (action, field, value) => {
    if (field === 'options') {
      if (action === 'change' || action === 'focus') {
        this.setState({
          currentInput: [value],
        });
      }
    }
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  validate = (values) => {
    let errors = {};
    let customErrors;
    const customFieldType = this.props.types.CustomField && this.props.types.CustomField.properties || {};

    if (!this.checkType(customFieldType.name, values.fieldName)) {
      errors.fieldName = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!values.fieldName.length) {
      errors.fieldName = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (values.fieldType === 'options' && !this.checkType(customFieldType.options, values.options)) {
      errors.options = 'Must be a valid string separated by commas';
    }

    if (typeof this.props.customValidator === 'function') {
      customErrors = this.props.customValidator(values);
    }

    if (customErrors) {
      errors = { ...errors, ...customErrors };
    }

    return errors;
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  renderMenuItem = (result) => {
    const labelKey = this.props.labelKey || 'label';

    if (result[labelKey]) {
      return (
        <a
          option={result}
          position={0}
          tabIndex="-1"
          className={'dropdown-item'}
          style={{ cursor: 'default' }}
        >
          {'Already Added'}
        </a>
      );
    }
    return (
      <MenuItem
        option={result}
        position={0}
        role="button"
        tabIndex="-1"
      >
        {`Click to add: ${result}`}
      </MenuItem>
    );
  };

  renderMenu = (results, menuProps) => {
    if (!results || !results.length) return null;
    return (
      <Menu {...menuProps}>
        {this.renderMenuItem(results[0])}
      </Menu>
    );
  };

  render() {
    const form = this.state.form;

    if (!form || !Object.keys(form).length) return null;

    return (
      <div className="card card-body mb-4">
        <div className="row mt-3">
          <div className="col-xs-12 col-md-5">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="fieldName"
              action={this.standardFormAction}
              label="Name"
              disabled={false}
              hideError={!form.fieldName.touched}
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.selectinput
              form={form}
              field="fieldType"
              action={this.standardFormAction}
              label="Field Type"
              options={fieldTypeOptions}
              placeholder={fieldTypeOptions[form.fieldType.value].display}
            />
          </div>
          <div className="col-xs-12 col-md-2">
            <Components.forms.components.switch
              form={form}
              field="isFieldRequired"
              action={this.standardFormAction}
              label="Required Field"
              disabled={this.props.updating}
            />
          </div>
          <div className="col-xs-12 col-md-1 d-none d-md-block">
            <button
              className="btn-circle float-end btn btn-outline-danger d-none d-md-block"
              onClick={() => this.props.destroy(this.state.name, this.state.key)}
            >
              <div className="mdi mdi-close" />
            </button>
          </div>
        </div>
        {(() => {
          if (this.state.optionsSelected) {
            return (
              <Fragment>
                <h3>Options Fields</h3>
                <div className="row">
                  <div className="col-9">
                    <Components.forms.components.typeahead
                      form={form}
                      field="options"
                      action={this.standardFormAction}
                      disabled={false}
                      hideError={!form.options.touched}
                      selected={this.state.selected}
                      options={this.state.currentInput}
                      renderMenu={this.renderMenu}
                      allowNew
                      multiple
                      minLength={2}
                      onTypeAheadChange={this.onTypeAheadChange}
                    />
                  </div>
                  <Components.forms.components.textinput
                    form={form}
                    field="hiddenOptions"
                    hidden
                  />
                </div>
              </Fragment>
            );
          }
        })()}
        {(() => {
          if (this.state.staticSelected) {
            return (
              <Fragment>
                <h3>Static Value</h3>
                <div className="row">
                  <div className="col-9">
                    <Components.forms.components.textinput
                      form={form}
                      field="hiddenOptions"
                      action={this.standardFormAction}
                    />
                  </div>

                </div>
              </Fragment>
            );
          }
        })()}
        <div className="row d-md-none">
          <div className="col-12 d-md-none">
            <Components.forms.components.button
              onClick={() => this.props.destroy(this.state.name, this.state.key)}
              buttonText="Remove Custom Field"
              className="btn btn-outline-danger w-100 d-md-none"
              icon="pe-1 mdi mdi-minus-circle"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_createcustomfield);


