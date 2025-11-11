import { connect, Component } from 'component';

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

class components_integrationcomps_cardsIntegration_GALILEO_forms_fundingProvider extends Component {

  state = {
    name: 'Components.integrationcomps.cardsIntegration.GALILEO.forms.fundingProvider',
  };

  componentDidMount() {
    const {
      initialize,
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, key, { fundingProvider: 'galileo' });
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
    const { form } = this.state;
    if (!form) return null;

    return (
      <form className="floating-labels components_integrationcomps_cardsIntegration_GALILEO_forms_fundingProvider">
        <div className="row">
          <div className="col-12">
            <h3>
              Which provider would you like to use for pull funding?
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <Components.forms.components.radio
              label="DWOLLA"
              form={form}
              action={this.standardFormAction}
              field="fundingProvider"
              value="DWOLLA"
              disabled={this.props.disabled}
            />
          </div>
          <div className="col-md-4">
            <Components.forms.components.radio
              label={this.props.provider}
              form={form}
              action={this.standardFormAction}
              field="fundingProvider"
              value={this.props.provider}
              disabled={this.props.disabled}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_cardsIntegration_GALILEO_forms_fundingProvider);


