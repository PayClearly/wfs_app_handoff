import { connect, Component, bindActionCreators, Fragment } from 'component';
import classNames from 'classnames';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

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

class components_forms_components_customToggleButton extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const form = this.props.form;
    const fieldName = this.props.field;
    const field = form[this.props.field];
    const hidden = this.props.hidden;

    if (!field || hidden) return null;

    const id = `${form._name}-${form._key}-input-${this.props.type}-${fieldName}`;
    const value = typeof field.value === 'object' ? this.props.label in field.value ? field.value[this.props.label] : field.value : field.value;
    return (
      <div className="components_forms_components_customToggleButton">
        <input
          type="checkbox"
          role="button"
          tabIndex="-1"
          className="input"
          style={{
            display: 'none',
          }}
          id={id}
          onChange={(e) => {
            this.props.action('change', fieldName, e.target.checked, this.props.label);
          }}
          value={value}
          checked={value}
          disabled={this.props.disabled}
        />
        <Components.ripple disabled={this.props.disabled} classes={`${value ? 'ripple-primary' : 'ripple-white'}`} onClick={(e) => { this.labelElement.click(); }}>
          <label ref={(label) => { this.labelElement = label; }} className={classNames('label-override no-select', this.props.selected && 'selected', this.props.disabled && 'disabled')} htmlFor={id}>
            <div className="card">
              {this.props.children}
            </div>
            <div className="overlay" />
            <i className="selected-icon mdi mdi-check-circle mdi-36px" />
          </label>
        </Components.ripple>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_components_customToggleButton);


