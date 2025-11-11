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

class components_forms_components_textArea extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const form = this.props.form;
    const fieldName = this.props.field;
    const field = form[this.props.field];
    const hidden = this.props.hidden;

    if (!field || hidden) return null;

    const id = `${form._name}-${form._key}-input-${fieldName}`;
    return (
      <div
        className={classNames('components_forms_components_textArea', 'form-group', { 'has-error': (field.error && !this.props.hideError) })}
      >
        <div className="padding-buffer">
          <textarea
            id={id}
            type="text"
            className="form-control"
            rows="4"
            onChange={(e) => {
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
          />
          <span className="bar" />
          {this.props.label && <label htmlFor={id} className={classNames({ required: this.props.required, isFloating: Boolean(field.value) })}> {this.props.label}</label>}
          {this.props.maximumCharacters && <small className="help-block maximum-character-counter">{field.value && field.value.length || '0'} / {this.props.maximumCharacters}</small>}
          <small className="help-block">{this.props.hideError && this.props.placeholder ? `${this.props.placeholder}` : ''}</small>
          <small className="fieldError text-danger">{(field.error && !this.props.hideError) ? field.error : '\u00A0'}</small>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_textArea);


