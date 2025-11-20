import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    context: Selectors.context(state),
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_integrationpreferences extends Component {

  state = {
    name: 'Components.forms.integrationpreferences',
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      formKey,
      initialData,
      integration,
    } = this.props;

    initialize(this.state.name, formKey || 'default', this.initialize(integration.possiblePreferences, initialData || {}));
    validate(this.state.name, formKey || 'default', this.validate());
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.props.formKey || 'default');
  }

  validate = () => {
    return (values) => {
      const errors = {};
      Object.keys(values || {}).forEach((key) => {
        const field = this.props.integration.possiblePreferences[key];
        if (field.required && !values[key]) {
          errors[key] = 'This field is required';
        }
      });
      return errors;
    };
  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.props.formKey || 'default', field, value);
      this.props.validate(this.state.name, this.props.formKey || 'default', this.validate(this.props.fields));
    } else {
      this.props[action](this.state.name, this.props.formKey || 'default', field);
    }
  };

  initialize = (fields, initialData = {}) => {
    const initialFields = {};
    Object.keys(fields || {}).forEach((key) => {
      const field = fields[key];
      switch ('reference') {
        case 'number':
        case 'string':
        case 'reference':
          initialFields[key] = (initialData[key]);
          break;
        case 'date':
          initialFields[key] = new Date((initialData[key]) || new Date());
          break;
        case 'options':
          initialFields[key] = field.options.split(',').find((option) => { return option.name === (initialData[key]); }) || field.options.split(',')[0];
          break;
        default:
          break;
      }
    });
    return initialFields;
  };

  render() {

    const { preferences, possiblePreferences } = this.props.integration;

    return (
      <form className="floating-labels components_forms_integrationpreference">
        {
          Object.keys(preferences || {}).filter(key => possiblePreferences && possiblePreferences[key]).map((key) => {
            const preference = possiblePreferences[key] || {};
            const fieldType = preference.type;
            const required = preference.required && preferences[key] === null;

            const field = {
              fieldType,
              required,
              name: key,
              label: preference.label,
              refPath: `account.${this.props.integration.name}.data.resources.${preference.refItem}`,
              refKey: preference.refDisplay,
            };

            return (
              <span>
                <Components.forms.components.dynamicfield
                  field={field}
                  fieldKey={field.name}
                  form={_try(() => this.props.forms[this.state.name][this.props.formKey || 'default'])}
                  formAction={this.standardFormAction}
                />
              </span>
            );
          })
        }
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_integrationpreferences);


