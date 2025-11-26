import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';
import FuzzySet from 'fuzzyset.js';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state, props) => ({
  forms: state.forms,
  templateFields: Selectors.customFileTemplateFields(state),
});

const mapDispatchToProps = (dispatch, props) => ({
  ...bindActionCreators(Store.forms, dispatch),
});

const mapResourcesToProps = (state, props) => ({

});

class components_forms_customFileField extends Component {

  state = {
    name: 'Components.forms.customFileField',
    mounted: false,
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData = {},
      parentFormKey,
      parentFormName,
      formKey,
      templateFields,
    } = this.props;
    initialize(this.state.name, formKey, {
      fieldName: _formatFieldName(initialData),
      pcField: _formatPcField(initialData) || (initialData.fieldName && _fuzzyFieldMatch(initialData.fieldName, templateFields.options)) || [],
      decoy: '',
    });
    if (parentFormKey && parentFormName) {

      this.props.addChild(parentFormName, parentFormKey, this.state.name, formKey);
    }
    validate(this.state.name, formKey, this.validate);
    this.setState({ mounted: true });

  }

  componentWillUnmount() {
  }

  onTypeAheadChange = (options) => {
    const data = options.length ? options.map((option) => this.props.templateFields.templateMap[option.display]) : [];
    this.props.change(this.state.name, this.props.formKey, 'pcField', data);
    this.props.validate(this.state.name, this.props.formKey, this.validate);
  };

  standardFormAction = (action, field, value) => {
    const { name } = this.state;
    if (action === 'change') {

      this.props[action](name, this.props.formKey, field, value);
      this.props.validate(name, this.props.formKey, this.validate);

    } else {
      this.props[action](name, this.props.formKey, field);
    }
    if (this.props.parentValidate && typeof this.props.parentValidate === 'function') { this.props.parentValidate(); }
  };

  validate = (values = {}) => {
    const errors = {};
    const pcFields = values.pcField || [];

    if (!values.fieldName || values.fieldName.length < 1) {
      errors.fieldName = 'A field name is required.';
    }
    if (pcFields.length === 1 && pcFields[0].includes('alias-')) {
      errors.fieldName = 'Field is required with an alias';
    }
    if (values.fieldName) {
      if (values.fieldName.includes(',')) {
        errors.fieldName = 'Commas are not allowed.';
      }

    }
    return errors;
  };

  render() {
    const { mode, forms } = this.props;
    const form = _try(() => forms[this.state.name][this.props.formKey]);
    if (!form || !this.state.mounted) { return null; }

    return (
      <form className="components_forms_customFileField floating-labels">
        <div className="row">
          <div className="col-sm-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="fieldName"
              action={this.standardFormAction}
              disabled={this.props.updating}
              required
            />
          </div>
          <div className="col-sm-12 col-md-5">
            <Components.forms.components.typeahead
              form={form}
              type="text"
              field="decoy"
              action={this.standardFormAction}
              disabled={this.props.disabled}
              selected={form.pcField.value.map((val) => this.props.templateFields.options[val])}
              multiple
              options={Object.values(this.props.templateFields.options) || []}
              labelKey="display"
              onTypeAheadChange={this.onTypeAheadChange}
              noItemsText="Not Found"
              floatLabel={Boolean(form.pcField.value.length)}
              maxResults={100}
            />
          </div>
          <div className="col-xs-12 col-md-1 d-none d-md-block">
            <button
              className="btn-circle float-end btn btn-outline-danger d-none d-md-block"
              onClick={(e) => { e.preventDefault(); this.props.removeField(this.props.formKey); this.props.destroy(this.state.name, this.props.formKey); }}
            >
              <div className="mdi mdi-close" />
            </button>
          </div>
        </div>

      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_customFileField);

// Internal Helper Functions ...
const _fuzzyFieldMatch = (query, set) => {
  const fuzzyset = FuzzySet(Object.values(set).map((f) => f.display));
  const setByDisplay = Object.keys(set).reduce((acc, cur) => {
    acc[set[cur].display] = cur;
    return acc;
  }, {});
  const match = fuzzyset.get(query, null, 0.5);
  return match ? [setByDisplay[match[0][1]]] : null;
};

const _formatPcField = ({ pcField, lineItemField, alias }) => {
  if (!pcField && !lineItemField) {
    return null;
  }

  const fields = [];
  if (pcField) {
    fields.push(pcField);
  }

  if (alias) {
    fields.push(alias);
  }

  if (lineItemField) {
    fields.push(`pcLine-${lineItemField}`);
  }

  return fields;
};

const _formatFieldName = ({ fieldName = '', format }) => ((fieldName && format) ? `${fieldName}?format=${format}` : fieldName);

