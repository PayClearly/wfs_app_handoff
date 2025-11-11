import { connect, Component, bindActionCreators, Fragment } from 'component';


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_forms_components_radio extends Component {




  render() {
    const form = this.props.form;
    const fieldName = this.props.field;
    const field = form[this.props.field];


    const id = `${form._name}-${form._key}-input-${fieldName}`;

    return (
      <div className="components_forms_components_radio" style={{ textAlign: 'center' }}>
        <label htmlFor={id}>{this.props.label}</label>
        <input
          type="radio"
          id={id}
          style={{ height: '1.5rem', display: 'block', width: '100%' }}
          onChange={(e) => {
            this.props.action('change', fieldName, e.target.value);
          }}
          checked={_try(() => field.value === this.props.value) || false}
          value={this.props.value}
          disabled={this.props.disabled || false}
        />
        <small className="fieldError text-danger">{(field.error && !this.props.hideError) ? field.error : '\u00A0'}</small>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_components_radio);


