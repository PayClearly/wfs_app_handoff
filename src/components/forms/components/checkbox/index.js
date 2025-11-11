import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import classNames from 'classnames';


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_forms_components_checkbox extends Component {




  render() {
    const form = this.props.form;
    const fieldName = this.props.field;
    const field = form[this.props.field];

    if (!field) return <span />;

    const id = `${form._name}-${form._key}-input-${fieldName}`;
    return (
      <div
        className={classNames('components_forms_components_checkbox', 'form-group', this.props.className, { 'has-error': (field.error && !this.props.hideError) })}
      >
        <div className="checkbox checkbox-primary">
          <input
            type="checkbox"
            className="form-check-input"
            id={id}
            onChange={(e) => {
              this.props.action('change', fieldName, e.target.checked);
            }}
            value={field.value}
            checked={field.value}
            disabled={this.props.disabled}
            required={this.props.required}
          />
          <label className="form-check-label" aria-label={this.props.ariaLabel || ''} htmlFor={id}>{this.props.label}{this.props.required && ' *'}</label>
          <small className="fieldError text-danger">{(field.error && !this.props.hideError) ? field.error : '\u00A0'}</small>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_checkbox);


