import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_integrationcomps_achintegration_DWOLLA_forms_ownershipcertification extends Component {

  state = {
    name: 'Components.integrationcomps.achintegration.DWOLLA.forms.ownershipcertification',
  };

  componentDidMount() {
    const {
      initialize,
      validate,
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, key, {
      acceptsCertification: false,
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

  validate = (values) => {
    const errors = {};

    if (!values.acceptsCertification) {
      errors.acceptsCertification = 'Must accept this certification';
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
      <form className="floating-labels components_integrationcomps_achintegration_DWOLLA_forms_ownershipcertification">
        <div className="row">
          <div className="col-12">
            <h3>
              I hereby certify, to the best of my knowledge, that the information provided during this process is complete and correct.
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Components.forms.components.checkbox
              form={form}
              action={this.standardFormAction}
              field="acceptsCertification"
              label="I acknowledge and accept this certification"
              disabled={this.props.disabled}
              required
              hideError={!form.acceptsCertification.touched}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_forms_ownershipcertification);


