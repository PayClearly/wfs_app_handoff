import { connect, Component } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_integrationcomps_achintegration_DWOLLA_forms_declareExemption extends Component {

  state = {
    name: 'Components.integrationcomps.achintegration.DWOLLA.forms.declareExemption',
  };

  componentDidMount() {
    const {
      initialize,
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, key, { choiceYes: false, choiceNo: false });
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
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels components_integrationcomps_achintegration_DWOLLA_forms_declareExemption">
        <div className="row">
          <div className="col-12">
            <h3>
              Nonprofit businesses are exempt from providing beneficial owner information. Does the business in question meet the criteria for exemption? If so, check yes.
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Components.forms.components.checkbox
              form={form}
              action={this.standardFormAction}
              field="choiceYes"
              label="Yes"
              disabled={this.props.disabled}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_forms_declareExemption);


