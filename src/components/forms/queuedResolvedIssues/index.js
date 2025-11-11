import { connect, Component, bindActionCreators, Fragment } from 'component';

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_queuedResolvedIssues extends Component {
  state = {
    name: 'Components.forms.queuedResolvedIssues',
  };

  componentDidMount() {
    const {
      initialize,
      validate,
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, key, {
      note: '',
    });

    validate(this.state.name, key, this.validate);
  }
  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, key, this.props.forms[this.state.name][key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  validate = (values) => {
    const errors = {};
    return errors;
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };


  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels components_forms_queuedResolvedIssues pt-2">
        <div className="row">
          <div className="col-12">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="note"
              action={this.standardFormAction}
              label="Note (optional)"
              disabled={this.props.disabled}
              hideError={!form.note.touched}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_queuedResolvedIssues);


