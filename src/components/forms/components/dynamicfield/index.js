import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_forms_components_dynamicfield extends Component {




  render() {
    const { field, fieldKey, form, formAction, disabled, disablePrefix, className, fieldPlaceholder, enforce } = this.props;
    const options = {};

    if (!form || !form[fieldKey]) {
      return (<span />);
    }

    const disabledForPrefix = disablePrefix && _try(() => fieldKey.indexOf(disablePrefix) === 0);

    switch (field.fieldType) {
      case 'date':
        return (
          <div className={`${className || 'col-12 col-md-4'}`}>
            <Components.forms.components.daypicker
              form={form}
              type="number"
              field={fieldKey}
              action={formAction}
              label={field.name}
              disabled={disabled || disabledForPrefix}
              required={field.required}
              hideError={!form[fieldKey].touched}
            />
          </div>
        );
      case 'number':
        return (
          <div className={`${className || 'col-12 col-md-4'}`}>
            <Components.forms.components.textinput
              form={form}
              type="string"
              field={fieldKey}
              action={formAction}
              label={field.name}
              disabled={disabled || disabledForPrefix}
              required={field.required}
              hideError={!form[fieldKey].touched}
              enforce={enforce}
            />
          </div>
        );
      case 'options':
        field.options.split(',').forEach((id) => {
          options[id] = { display: id };
        });
        return (
          <div className={`${className || 'col-12 col-md-4'}`}>
            <Components.forms.components.selectinput
              form={form}
              field={fieldKey}
              action={formAction}
              label={field.name}
              options={options}
              disabled={disabled || disabledForPrefix}
              hideError={!form[fieldKey].touched}
              required={field.required}
              placeholder={fieldPlaceholder}
            />
          </div>
        );
      case 'reference':
        return (
          <Components.forms.components.referenceinput
            form={form}
            field={fieldKey}
            action={formAction}
            label={field.label || field.name}
            disabled={disabled || disabledForPrefix}
            hideError={!form[fieldKey].touched}
            required={field.required}
            refPath={field.refPath}
            refKey={field.refKey}
          />
        );
      case 'string':
      default:
        return (
          <div className={`${className || 'col-12 col-md-4'}`}>
            <Components.forms.components.textinput
              form={form}
              type="text"
              field={fieldKey}
              action={formAction}
              label={field.name}
              disabled={disabled || disabledForPrefix}
              required={field.required}
              hideError={!form[fieldKey].touched}
              fieldPlaceholder={fieldPlaceholder}
            />
          </div>
        );
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_dynamicfield);


