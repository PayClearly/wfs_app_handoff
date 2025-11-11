/* eslint-disable no-unused-vars */
import { connect, Component } from 'component';

// Third Party Imports ...
import classNames from 'classnames';

import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_forms_components_textinput extends Component {

  render() {
    const { form } = this.props;
    const fieldName = this.props.field;
    const field = form[this.props.field];
    const { hidden } = this.props;

    if (!field || hidden) { return null; }

    const id = `${form._name}-${form._key}-input-${this.props.type}-${fieldName}`;
    return (
      <div
        className={classNames('form-group', { 'has-error': (field.error && !this.props.hideError) })}
      >
        <input
          type={this.props.type}
          id={id}
          className="input-sm form-control"
          onChange={(e) => {
            if (this.props.enforce && !this.props.enforce.test(e.target.value)) { return; }
            this.props.action('change', fieldName, e.target.value);
          }}
          onBlur={() => {
            this.props.action('blur', fieldName);
          }}
          onFocus={() => {
            this.props.action('focus', fieldName);
          }}
          value={field.value}
          disabled={this.props.disabled || false}
          required
          data-field-name={fieldName}
          placeholder={this.props.fieldPlaceholder}
          ref={(input) => {
            if (typeof this.props.setRef === 'function') { this.props.setRef(input); }
          }}
        />
        <span className="bar" />
        {this.props.label && (
          <label
            htmlFor={id}
            className={classNames({
              required: this.props.required,
              isFloating: Boolean(field.value || this.props.fieldPlaceholder),
            })}
          >
            {this.props.label}
          </label>
        )}
        <small className="help-block">
          {this.props.hideError && this.props.placeholder ? `${this.props.placeholder}` : ''}
        </small>
        <small className={classNames({ 'help-block': true, truncate: this.props.truncate })}>
          {(!field.error || this.props.hideError)
            && this.props.detailedInformation
            && !this.props.placeholder
            ? `${this.props.detailedInformation}`
            : ''}
        </small>
        <small className="fieldError text-danger">
          {(field.error && !this.props.hideError) ? field.error : '\u00A0'}
        </small>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_textinput);
