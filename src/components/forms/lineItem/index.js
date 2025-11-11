import { connect, Component, bindActionCreators } from 'component';
import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state) => ({
  forms: state.forms,
  types: state.validations.data.item,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(Store.forms, dispatch),
});

// eslint-disable-next-line camelcase
class components_forms_lineItem extends Component {

  state = {
    name: 'Components.forms.lineItem',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const initialData = this.props.initialData || {};

    initialize(this.state.name, key, {
      date: initialData.date || '',
      invoice: initialData.invoice || '',
      description: initialData.description || '',
      balance: initialData.balance || '',
      discount: initialData.discount || '',
      amount: initialData.amount || '',
    });
    validate(this.state.name, key, this.validate);

    if (_try(() => this.props.parent.formName && this.props.parent.formKey)) {
      this.props.addChild(this.props.parent.formName, this.props.parent.formKey, this.state.name, key);
    }
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

  checkType = (type, against) => Utils.typesvalidator.validateType(this.props.types, type, against).valid;

  validate = (values) => {
    const errors = {};

    return errors;
  };

  render() {
    const { form } = this.state;
    if (!form) { return null; }

    return (
      <form className="components_forms_lineItem floating-labels">
        <div className="row">
          <div className="col-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="date"
              action={this.standardFormAction}
              label="Date"
              disabled={this.props.disabled}
              hideError={!form.date.touched}
            />
          </div>
          <div className="col-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="invoice"
              action={this.standardFormAction}
              label="Invoice Number"
              disabled={this.props.disabled}
              hideError={!form.invoice.touched}
            />
          </div>
          <div className="col-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="description"
              action={this.standardFormAction}
              label="Description"
              disabled={this.props.disabled}
              hideError={!form.description.touched}
            />
          </div>
          <div className="col-12 col-md-4">
            <Components.forms.components.maskedinput
              form={form}
              maskPlaceholder=""
              type="string"
              field="balance"
              useNumberMask
              action={this.standardFormAction}
              label="Balance"
              disabled={this.props.disabled}
              hideError={_try(() => !form.balance.touched)}
            />
          </div>
          <div className="col-12 col-md-4">
            <Components.forms.components.maskedinput
              form={form}
              maskPlaceholder=""
              type="string"
              field="discount"
              useNumberMask
              action={this.standardFormAction}
              label="Discount"
              disabled={this.props.disabled}
              hideError={_try(() => !form.discount.touched)}
            />
          </div>
          <div className="col-12 col-md-4">
            <Components.forms.components.maskedinput
              form={form}
              maskPlaceholder=""
              type="string"
              field="amount"
              useNumberMask
              action={this.standardFormAction}
              label="Total"
              disabled={this.props.disabled}
              hideError={_try(() => !form.amount.touched)}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_lineItem);
