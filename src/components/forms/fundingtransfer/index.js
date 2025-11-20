import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    integrations: Selectors.integrations(state),
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_fundingtransfer extends Component {
  state = {
    name: 'Components.forms.fundingtransfer',
    fundingSourceOptions: {},
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData = {},
    } = this.props;

    const achFundingSourceIntegration = this.props.integrations.achFundingSource;

    const key = this.props.formKey || 'default';
    initialize(this.state.name, key, {
      amount: initialData.amount || '',
      fundingSource: achFundingSourceIntegration.name || initialData.fundingSource || '',
      note: initialData.note || '',
    });
    validate(this.state.name, key, this.validate);
  }

  componentWillReceiveProps(nextProps = {}) {
    const key = this.props.formKey || 'default';
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

  validate = (values) => {
    const errors = {};

    Object.keys(values).forEach((value) => {
      if (value === 'note' && this.props.forManualDepositRelease) return;
      if (!values[value]) errors[value] = 'This field is required';
    });

    if (this.props.withdrawal && values.amount && values.amount > 0) {
      errors.amount = 'Must be a negative amount';
    }

    return errors;
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  }

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels mb-4">
        <div className="row pt-4">
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.maskedinput
              form={form}
              type="string"
              field="amount"
              action={this.standardFormAction}
              useNumberMask
              allowNegativeNumber={this.props.withdrawal}
              maskPlaceholder={!this.props.withdrawal ? '' : '-$'}
              label="Transfer Amount"
              disabled={this.props.disabled || this.props.forManualDepositRelease}
              hideError={!form.amount.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              field="fundingSource"
              action={this.standardFormAction}
              placeholder={(this.state.fundingSourceOptions[form.fundingSource.value] && this.state.fundingSourceOptions[form.fundingSource.value].display) || ''}
              label="Funding Source"
              disabled
              hideError
              required
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              field="note"
              action={this.standardFormAction}
              label="Note"
              disabled={this.props.disabled}
              hideError={!form.note.touched}
              required={!this.props.forManualDepositRelease}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_fundingtransfer);


