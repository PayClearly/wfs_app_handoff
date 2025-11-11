import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_approveautodraft extends Component {

  state = {
    name: 'Components.forms.approveautodraft',
  };

  componentDidMount() {
    const { initialize, validate, initialData = {} } = this.props;
    const formKey = this.props.formKey || 'default';
    initialize(this.state.name, formKey, {
      approveAutoDraft: initialData.approveAutoDraft || false,
      disapproveAutoDraft: initialData.disapproveAutoDraft || false,
    });

    validate(this.state.name, formKey, this.validate);
    this.setState({ key: formKey });
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }

    if (this.props.neededFunds !== nextProps.neededFunds) {
      this.props.reset(this.state.name, nextProps.formKey, { approveAutoDraft: false, disapproveAutoDraft: false });
      this.props.validate(this.state.name, nextProps.formKey, this.validate);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || 'default'],
      key: nextProps.formKey || 'default',
    });
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    const fields = {};
    fields[field] = value;
    if (action === 'change') {
      if (field === 'approveAutoDraft') {
        fields.disapproveAutoDraft = !value;
      } else {
        fields.approveAutoDraft = !value;
      }
      this.props[action](this.state.name, this.state.key, fields);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  validate = (fields) => {
    const errors = {};

    if (!fields.approveAutoDraft && !fields.disapproveAutoDraft) {
      const message = 'Must select an option';
      errors.approveAutoDraft = message;
      errors.disapproveAutoDraft = message;
    }

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels no-disabled-opacity components_forms_approveautodraft">
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.checkbox
              form={form}
              field="approveAutoDraft"
              action={this.standardFormAction}
              label="Yes"
              disabled={this.props.disabled || form.approveAutoDraft.value}
              hideError={!form.approveAutoDraft.touched}
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.checkbox
              form={form}
              field="disapproveAutoDraft"
              action={this.standardFormAction}
              label="No"
              disabled={this.props.disabled || form.disapproveAutoDraft.value}
              hideError={!form.disapproveAutoDraft.touched}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_approveautodraft);


