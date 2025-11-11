import { connect, Component, bindActionCreators } from 'component';

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    ...bindActionCreators(Store.forms, dispatch),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_forms_opsNotes extends Component {

  state = {
    name: 'Components.forms.opsNotes',
  }

  componentDidMount() {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const { initialize, validate } = this.props;
    initialize(this.state.name, key, {
      message: '',
      type: 'general',
    });
    validate(this.state.name, key, this.validate);
  }

  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const errors = {};

    if (values.message.length > 140) errors.message = 'Message exceeds character limit (140)'; 
    if (!values.message) errors.message = 'Field is required';
    if (!values.type) errors.type = 'Field is required';

    return errors;
  };


  render() {
    const form = this.state.form;
    if (!form) return null;
    const { resourceType } = this.props;
    return (
      
      <div className="col-12 col-md-6">
        <form 
          className="components_forms_opsNotes floating-labels"
        >
          <div className="row">
            <div className={resourceType === 'paymentStatuses' ? 'col-8' : 'col-12'}>
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="message"
                action={this.standardFormAction}
                label="Message"
                disabled={this.props.disabled}
                hideError={!form.message.touched}
                required
              />
            </div>
            { 
              resourceType === 'paymentStatuses' &&
              <div className="col-4">
                <Components.forms.components.selectinput
                  form={form}
                  field="type"
                  action={this.standardFormAction}
                  label="Type"
                  options={TYPE_OPTIONS}
                  placeholder={TYPE_OPTIONS.general.display}
                  disabled={this.props.disabled}
                  hideError={!form.type.touched}
                  required
                />
              </div>
            }
          </div>
        </form>
      </div>
        
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_opsNotes);

// Internal Helper Functions ... 
const TYPE_OPTIONS = {
  general: {
    display: 'General',
  },
  refund: {
    display: 'Refund',
  },
  exception: {
    display: 'Exception',
  },
};
// GENERATOR_TYPE='component';
