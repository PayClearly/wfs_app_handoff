import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import classNames from 'classnames';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_forms_components_selectinput extends Component {




  render() {
    const form = this.props.form;
    const fieldName = this.props.field;
    const field = form[fieldName];
    // only way to filter by all options is to pass null, but need to display 'all'

    if (!field) return <span />;

    const id = `${form._name}-${form._key}-input-${fieldName}`;

    return (
      <div
        className={classNames('form-group', this.props.className, { 'has-error': (field.error && !this.props.hideError) }, 'components_forms_components_selectinput', { 'mute-placeholder-text': (!field.value && this.props.placeholder) })}
      >
        <select
          style={{ '-webkit-appearance': 'none' }}
          className="form-control"
          disabled={this.props.disabled}
          required={this.props.required}
          onChange={(e) => {
            this.props.action('change', fieldName, e.target.value);
          }}
          data-field-name={fieldName}
          ref={(input) => { if (typeof this.props.setRef === 'function') this.props.setRef(input); }}
        >
          <option value="" selected={!field.value} disabled={field.value} hidden>{this.props.placeholder || ''}</option>
          {this.props.includeResetOption &&
            <option value="" selected={false} disabled={!field.value} />
          }
          {field.value && !Object.keys(this.props.options).find(option => field.value === option) &&
            <option value="" selected hidden>{field.value}</option>
          }
          {
            this.props.options &&
            Object.keys(this.props.options)
              .map((key) => {
                // if the selected options matches a key from the overall options remove it from the menu to avoid duplication
                const item = this.props.options[key] || {};
                if (this.props.hasOptGroups) {
                  return (
                    <optgroup label={item.display}>
                      {Object.keys(item.subOptions).map((subKey) => {
                        if (!item.subOptions[subKey].display) return null;
                        return (
                          <option value={subKey}>{item.subOptions[subKey].display}</option>
                        );
                      })}
                    </optgroup>
                  );
                }

                if (!item.display) return null;
                return (
                  <option value={key} selected={key === field.value} disabled={key === field.value}>{item.display}</option>
                );
              })
          }
        </select>
        <span className="bar" />
        {this.props.label &&
          <label
            htmlFor={id}
            className={classNames({
              required: this.props.required,
              isFloating: Boolean(field.value || this.props.placeholder || typeof field.value === 'string'),
            })}
            style={{ pointerEvents: 'none' }}
          >
            {this.props.label}
          </label>
        }
        <small className="fieldError text-danger">{(field.error && !this.props.hideError) ? field.error : '\u00A0'}</small>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_selectinput);


