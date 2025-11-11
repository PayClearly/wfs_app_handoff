import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import { Collapse } from 'react-collapse';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_fundingPreferences extends Component {
  state = {
    name: 'Components.forms.fundingPreferences',
  };

  componentDidMount() {
    const { initialize, validate, initialFormData = {}, id = 'default' } = this.props;
    initialize(this.state.name, this.props.id, {
      fundingStrategy: initialFormData.fundingStrategy || 'accountBalance',
      automaticFundingEnabled: Boolean(initialFormData.automaticFundingType) || false,
      automaticFundingType: initialFormData.automaticFundingType || 'eod',
    });
    validate(this.state.name, id, this.validate);
  }

  componentWillReceiveProps(nextProps = {}) {
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.id || 'default'],
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.props.id || 'default');
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.props.id || 'default', field, value);
      this.props.validate(this.state.name, this.props.id || 'default', this.validate);
    } else {
      this.props[action](this.state.name, this.props.id || 'default', field);
    }
  };

  validate = (values) => {
    const errors = {};

    // must make this universal not just PDT compatible
    if (parseInt(values.epochOffset, 10) > (21 * 60 * 60000)) {
      errors.epochOffset = 'Cutoff must be before 5PM EST';
    }

    return errors;
  };

  render() {
    const form = this.state.form;
    const { updating } = this.props;
    if (!form) return null;

    return (
      <form className="form material floating-labels components_forms_fundingPreferences">
        <div className="row mb-1">
          <div className="col-sm">
            <Components.forms.components.selectinput
              form={form}
              className="mb-0"
              field="fundingStrategy"
              action={this.standardFormAction}
              label="Preferred Funding Type"
              options={{
                accountBalance: {
                  display: 'Standard',
                },
                earmark: {
                  display: 'Batch Based',
                },
              }}
              disabled={updating}
              hideError={!form.fundingStrategy.touched}
            />
          </div>
        </div>
        <div className="row mb-2">
          <div className="col">
            {_try(() => form.fundingStrategy.value) === 'earmark' &&
              <h6>Batch Based funding will exclude the account balance when calculating the amount needed to transfer for all pending payments. (e.g. if you submit 100K in payments and have 10K in your account balance the transfer will be for 100K).</h6>
            }
            {_try(() => form.fundingStrategy.value) === 'accountBalance' &&
              <h6>Standard funding will include the account balance when calculating the amount needed to transfer for all pending payments. (e.g. if you submit 100K in payments and have 10K in your account balance the transfer will be for 90K).</h6>
            }
          </div>
        </div>
        <div className="row">
          <div className="col-sm">
            <Components.forms.components.checkbox
              form={form}
              className="mb-0"
              field="automaticFundingEnabled"
              action={this.standardFormAction}
              label="Enable Automatic Funding"
              disabled={updating}
            />
            {!form.automaticFundingEnabled.value &&
              <h6>If not enabled, users are responsible for submitting transfers for payments</h6>
            }
          </div>
        </div>
        <Collapse isOpened={form.automaticFundingEnabled.value} >
          <div className="row pt-2">
            <div className="col-sm">
              <Components.forms.components.selectinput
                form={form}
                className="mb-0"
                field="automaticFundingType"
                action={this.standardFormAction}
                label="Automatic Funding Type"
                options={{
                  eod: {
                    display: 'End-Of-Day Funding',
                  },
                  payment: {
                    display: 'Instant Funding',
                  },
                }}
                disabled={updating}
                hideError={!form.automaticFundingType.touched}
              />
            </div>
          </div>
          <div className="row pt-1">
            <div className="col">
              {_try(() => form.automaticFundingType.value) === 'eod' &&
                <h6>End-Of-Day funding will automatically create a transfer at the end of the business day, 4:45 PM ET, to fund payments (e.g. any number of payments submitted before 4:45 PM will be funded at 4:45 PM, payments created after the cutoff will be funded the next day).</h6>
              }
              {_try(() => form.automaticFundingType.value) === 'payment' &&
                <h6>Instant funding will automatically create a transfer to fund payments when the payments are submitted (e.g. payments submitted at 9 AM will be funded at 9 AM).</h6>
              }
            </div>
          </div>
        </Collapse>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_fundingPreferences);


