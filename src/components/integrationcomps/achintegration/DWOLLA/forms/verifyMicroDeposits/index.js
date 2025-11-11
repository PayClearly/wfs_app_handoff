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

class components_integrationcomps_achintegration_DWOLLA_forms_verifyMicroDeposits extends Component {

  state = {
    name: 'Components.integrationcomps.achintegration.DWOLLA.forms.verifyMicroDeposits',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const formKey = this.props.formKey || 'default';
    initialize(this.state.name, formKey, {
      amountOne: '',
      amountTwo: '',
    });
    validate(this.state.name, formKey, this.validate);

    this.setState({ key: formKey });
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || 'default'],
      key: nextProps.formKey || 'default',
    });
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (fields) => {
    const errors = {};

    if (!/^[0-9].[0-9]{2}$/.test(fields.amountOne)) {
      errors.amountOne = 'Must be of format X.XX';
    }

    if (!/^[0-9].[0-9]{2}$/.test(fields.amountTwo)) {
      errors.amountTwo = 'Must be of format X.XX';
    }

    if (!fields.amountOne) errors.amountOne = 'This field is required';
    if (!fields.amountTwo) errors.amountTwo = 'This field is required';

    return errors;
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
      <form className="floating-labels">
        <div className={'row'}>
          <div className={'col-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              field="amountOne"
              action={this.standardFormAction}
              label="Amount One"
              required
              hideError={!form.amountOne.touched}
              disabled={this.props.updating}
            />
          </div>
          <div className={'col-12 col-md-6'}>
            <Components.forms.components.textinput
              form={form}
              field="amountTwo"
              action={this.standardFormAction}
              label="Amount Two"
              required
              hideError={!form.amountTwo.touched}
              disabled={this.props.updating}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_forms_verifyMicroDeposits);


