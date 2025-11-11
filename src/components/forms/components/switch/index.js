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

class components_forms_components_switch extends Component {




  render() {
    const form = this.props.form;
    const fieldName = this.props.field;
    const field = form[this.props.field];

    if (!field) return <span />;

    const id = `${form._name}-${form._key}-input-${fieldName}-${this.props.label}`;
    return (
      <div className="components_forms_components_switch">
        {this.props.useIconLabel ?
          <i className={`mdi ${this.props.icon} ${field.value[this.props.label] ? 'text-primary' : ''}`} style={{ fontSize: '1.5rem' }} />
          :
          <p className={`mb-0 pb-0${this.props.disabled ? ' disabled' : ''}`} style={{ fontSize: '12px', position: 'relative', top: this.props.centeredLabel ? '5px' : '-10px', fontWeight: 400 }} >{this.props.label || ''}</p>
        }
        <div style={{ position: 'relative', top: this.props.useIconLabel ? '-35px' : '-18px', left: this.props.useIconLabel ? '2rem' : '' }} className={classNames('custom-switch custom-switch-label-yesno', this.props.useIconLabel ? 'icon-switch' : 'mb-4')}>
          <input
            type="checkbox"
            role="button"
            tabIndex="-1"
            className="custom-switch-input"
            id={id}
            onChange={(e) => {
              this.props.action('change', fieldName, e.target.checked, this.props.label);
            }}
            value={typeof field.value === 'object' ? this.props.label in field.value ? field.value[this.props.label] : field.value : field.value}
            checked={typeof field.value === 'object' ? this.props.label in field.value ? field.value[this.props.label] : field.value : field.value}
            disabled={this.props.disabled}
          />
          <label className="custom-switch-btn" htmlFor={id} />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_switch);


