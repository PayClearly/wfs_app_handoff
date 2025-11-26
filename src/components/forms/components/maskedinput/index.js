import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import MaskedInput from 'react-text-mask';
import classNames from 'classnames';

import Utils from 'utils';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_forms_components_maskedinput extends Component {

  state = { hasFocused: false }

  render() {
    const form = this.props.form;
    const fieldName = this.props.field;
    const field = form[this.props.field];
    const hidden = this.props.hidden;

    const options = { suffixOverride: this.props.suffix, noPrefix: this.props.noPrefix, decimalLimit: this.props.decimalLimit };
    const numberMask = (this.props.useNumberMask)
      ? Utils.createnumbermask({ allowDecimal: true, allowNegative: this.props.allowNegativeNumber || false }, options)
      : null;

    if (!field || hidden) return null;

    const id = `${form._name}-${form._key}-input-${this.props.type}-${fieldName}`;

    return (
      <div
        className={classNames('form-group', { 'has-error': (field.error && !this.props.hideError) })}
      >
        {/* Necessary hack to prevent placeholder text from displaying before component is focused */}
        {this.state.hasFocused
          ? <MaskedInput
            autoFocus
            value={field.value}
            type={this.props.type}
            guide={false}
            id={id}
            mask={numberMask || this.props.mask}
            placeholder={this.props.maskPlaceholder}
            className="components_forms_components_maskedinput input-sm form-control"
            onChange={(e) => {
              // Remove any cosmetic mask characters from number
              const value = (numberMask)
                ? e.target.value.replace(/[,%\$]/g, '')
                : e.target.value;
              this.props.action('change', fieldName, value);
            }}
            onBlur={() => {
              this.setState({ hasFocused: false }, () => {
                this.props.action('blur', fieldName);
              });
            }}
            disabled={this.props.disabled || false}
            required
          />
          : <MaskedInput
            type={this.props.type}
            id={id}
            mask={numberMask || this.props.mask}
            className="components_forms_components_maskedinput input-sm form-control"
            onFocus={() => {
              this.setState({ hasFocused: true }, () => {
                this.props.action('focus', fieldName);
              });
            }}
            value={field.value}
            disabled={this.props.disabled || false}
            required
          />}

        <span className="bar" />
        {this.props.label && <label htmlFor={id} className={classNames({ required: this.props.required, isFloating: Boolean(field.value) })}> {this.props.label}</label>}
        <small className="help-block">{this.props.hideError && this.props.placeholder ? `${this.props.placeholder}` : ''}</small>
        <small className="help-block">{(!field.error || this.props.hideError) && this.props.detailedInformation && !this.props.placeholder ? `${this.props.detailedInformation}` : ''}</small>
        <small className="fieldError text-danger">{(field.error && !this.props.hideError) ? field.error : '\u00A0'}</small>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_maskedinput);

