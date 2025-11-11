import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
    revenueShares: state.revenueShares,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_components_bintier extends Component {

  state = {
    name: 'createRevenueShare',
  };

  componentDidMount() {
    const { initialize, validate, formKey } = this.props;
    const values = _try(() => this.props.forms['Components.forms.createrevenueshare'][formKey]._values) || {};

    initialize(this.state.name, formKey, {
      min: values.min || '',
      rate: values.rate || '',
    });

    validate(this.state.name, formKey, this.validate);

    this.setState({ key: formKey });
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey],
      key: nextProps.formKey,
    });
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

  validate = (fields) => {
    const errors = {};

    Object.keys(fields).forEach((fieldKey) => {
      if (fields[fieldKey].length === 0) {
        errors[fieldKey] = 'This field cannot be blank';
      }
    });

    const isValidPercentage = (field) => { return /^[0-9][0-9]?(\.[0-9]{1,5}?)?$/.test(field); };

    if (fields.rate && !isValidPercentage(fields.rate.replace('%', '').trim())) {
      errors.rate = 'Invalid value';
    }

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    const creating = this.props.revenueShares.status.creating;

    return (
      <div className="row">
        <div className="col-4">
          <Components.forms.components.maskedinput
            form={form}
            maskPlaceholder=""
            type="string"
            field="min"
            useNumberMask
            action={this.standardFormAction}
            label="Minimum"
            disabled={this.props.creating}
            hideError={!form.min.touched}
            required
          />
        </div>
        <div className="col-4">
          <Components.forms.components.maskedinput
            form={form}
            maskPlaceholder=""
            type="string"
            field="rate"
            useNumberMask
            decimalLimit={5}
            noPrefix
            suffix=" %"
            action={this.standardFormAction}
            label="Rate"
            disabled={this.props.creating}
            hideError={!form.rate.touched}
            required
          />
        </div>
        <div className="col-3 ms-4">
          <Components.forms.components.button
            onClick={() => this.props.remove(this.state.key)}
            className={'ms-3 btn btn-outline-primary'}
            type="button"
            aria-label="button"
            disabled={creating}
            buttonText="Remove Tier"
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_bintier);


