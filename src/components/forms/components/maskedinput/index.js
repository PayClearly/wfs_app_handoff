import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import MaskedInput from 'react-text-mask';
import classNames from 'classnames';

import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

/*
  Component behaves exactly as TextInput component, but now handles the following props:
    mask (required): <Array or Function> defines how user input should be masked, see readme below for syntax & examples
    maskPlaceholder (optional): <String> value to show when input field is empty and focused
    useNumberMask (optional): <Boolean> if true, use special dollar amount number mask. Will override any mask prop
      noPrefix (optional): <Boolean> disable default prefix when using number mask. Useful when displaying percentages
      suffixOverride (optional): <String> character to display after input. Empty by default
      decimalLimit (optional): <Number> limits characters to the right of the decimal point. Defaults to 2

  Full Documentation: https://github.com/text-mask/text-mask/blob/master/componentDocumentation.md#readme
*/

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_forms_components_maskedinput extends Component {

  state = { hasFocused: false }

  componentDidMount() { }
  componentWillUnmount() { }

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


