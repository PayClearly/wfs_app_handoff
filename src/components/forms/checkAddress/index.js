import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    countryCodes: Selectors.countryCodes(),
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

class components_forms_checkAddress extends Component {

  state = {
    name: 'Components.forms.checkAddress',
    key: 'default',
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData = {},
    } = this.props;
    const key = this.props.formKey || this.state.key;
    this.setState({ key });

    initialize(this.state.name, key, {
      checkAddressLine1: initialData.checkAddressLine1 || '',
      checkAddressLine2: initialData.checkAddressLine2 || '',
      checkCity: initialData.checkCity || '',
      checkStateProv: initialData.checkStateProv || '',
      checkPostalCode: initialData.checkPostalCode || '',
      checkCountry: initialData.checkCountry || 'USA',
    });
    validate(this.state.name, key, this.validate);
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  validate = (values) => {
    const errors = {};

    return errors;
  };

  standardFormAction = (action, field, value) => {
    const form = _try(() => this.props.forms[this.state.name][this.state.key], null);
    if (!form) return null;

    const fields = {};
    fields[field] = value;

    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, fields);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  render() {
    const form = _try(() => this.props.forms[this.state.name][this.state.key], null);
    const countries = Object.entries(this.props.countryCodes).reduce((acc, [code, name]) => {
      acc[code] = { display: name };
      return acc;
    }, {});

    if (!form) return null;

    return (
      <form className="components_forms_checkAddress floating-labels">
        <div className="row mt-2">
          <div className="col-xs-10 col-md-12">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="checkAddressLine1"
              action={this.standardFormAction}
              label="Address Line 1"
              disabled={this.props.disabled}
              hideError={!form.checkAddressLine1.touched}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-10 col-md-12">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="checkAddressLine2"
              action={this.standardFormAction}
              label="Address Line 2"
              disabled={this.props.disabled}
              hideError={!form.checkAddressLine2.touched}
            />
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-xs-10 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="checkCity"
              action={this.standardFormAction}
              label="City"
              disabled={this.props.disabled}
              hideError={!form.checkCity.touched}
            />
          </div>
          <div className="col-xs-10 col-md-2">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="checkStateProv"
              action={this.standardFormAction}
              label="State"
              disabled={this.props.disabled}
              hideError={!form.checkStateProv.touched}
            />
          </div>
          <div className="col-xs-10 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="checkPostalCode"
              action={this.standardFormAction}
              label="Zip Code"
              disabled={this.props.disabled}
              hideError={!form.checkPostalCode.touched}
            />
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-xs-10 col-md-12">
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="checkCountry"
              options={countries}
              action={this.standardFormAction}
              label="Country"
              disabled={this.props.disabled}
              hideError={!form.checkCountry.touched}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_checkAddress);


