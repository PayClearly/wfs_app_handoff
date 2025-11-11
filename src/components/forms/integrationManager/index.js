import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  const integrationName = _try(() => props.formKey.split('-')[0]);
  const resourceName = _try(() => props.formKey.split('-')[1]);
  return ({
    integrationName,
    resourceName,
    resource: _try(() => state.integrationDefinitions.data.items[integrationName].resources[resourceName]),
    forms: state.forms,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_integrationManager extends Component {
  state = {
    name: 'Components.forms.integrationManager',
    INTEGRATION_Preferences: {
      erpIntegration: {
        accounts: {
          name: { fieldType: 'string', initial: '' },
        },
        categories: {
          name: { fieldType: 'string', initial: '' },
        },
        vendors: {
          name: { fieldType: 'string', initial: '' },
        },
      },
      cardsIntegration: {
        accounts: {
          availableBalance: { fieldType: 'number', initial: 0 },
          creditLimit: { fieldType: 'number', initial: 0 },
          targetCreditLimit: { fieldType: 'number' },
        },
        pCards: {
          _id: { fieldType: 'string', initial: Date.now() },
          cycleTransactionAmountLimit: { fieldType: 'number'},
          cycleTransactionAmountUsed: { fieldType: 'number'},
          cycleTransactionCountLimit: { fieldType: 'number'},
          cycleTransactionCountUsed: { fieldType: 'number'},
          dailyTransactionAmountLimit: { fieldType: 'number'},
          dailyTransactionAmountUsed: { fieldType: 'number'},
          dailyTransactionCountLimit: { fieldType: 'number'},
          dailyTransactionCountUsed: { fieldType: 'number'},
          transactionAmountLimit: { fieldType: 'number'},
          status: { fieldType: 'options', options: 'active,on_hold,cancelled,stolen', initial: 'active'},
          id: { hide: true },
          cardNumberLastFour: { hide: true }, // pCards use cardLast4, need to remove this from definition
        },
        vCards: {
          _id: { fieldType: 'string', initial: Date.now() },
          amount: { fieldType: 'number', initial: 0 },
          maxUses: { fieldType: 'number', initial: 1 },
          status: { fieldType: 'options', options: 'active,cancelled', initial: 'active' },
          id: { hide: true },
        },
        auths: {
          _id: { fieldType: 'string', initial: Date.now() },
          amount: { fieldType: 'number', initial: 0 },
          at: { fieldType: 'string', initial: Date.now() },
          merchant: { fieldType: 'string', initial: 'Test Merchant' },
          _cardId: { fieldType: 'reference', refPath: 'account.cardsIntegration.data.resources.vCards|account.cardsIntegration.data.resources.pCards', refKey: 'id' },
          id: { hide: true },
          cardId: { hide: true },
        },
        clears: {
          _id: { fieldType: 'string', initial: Date.now()},
          _cardId: { fieldType: 'reference', refPath: 'account.cardsIntegration.data.resources.vCards|account.cardsIntegration.data.resources.pCards', refKey: 'id' },
          amount: { fieldType: 'number', initial: 0 },
          at: { fieldType: 'string', initial: Date.now() },
          id: { hide: true },
          cardId: { hide: true },
        },
        declines: {
          _id: { fieldType: 'string', initial: Date.now() },
          at: { fieldType: 'string', initial: Date.now() },
          reason: { fieldType: 'string', initial: '0 NOT ACCEPTABLE' },
          type: { fieldType: 'string', initial: 'DECLINE' },
          _cardId: { fieldType: 'reference', refPath: 'account.cardsIntegration.data.resources.vCards|account.cardsIntegration.data.resources.pCards', refKey: 'id' },
          id: { hide: true },
          cardId: { hide: true },
        }, 
      },
      achIntegration: {
        transfers: {
          amount: { fieldType: 'number', initial: 0 },
          status: { fieldType: 'string', initial: 'pending' },
        },
      },
      checksIntegration: {
        checks: {
          amount: { fieldType: 'number', initial: 0 },
          created: { fieldType: 'number', initial: Date.now() },
          deliveredAt: { fieldType: 'number', initial: 0 },
          shippedAt: { fieldType: 'number', initial: 0 },
          shippingMethod: { fieldType: 'string', initial: 'standard' },
          status: { fieldType: 'string', initial: 'pending' },
          tracking: { fieldType: 'string', initial: '' },
        },
      },
    },
  }

  componentDidMount() {
    const {
      initialize,
      validate,
      resource,
      initialData = {},
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, key, Object.keys(resource.properties).reduce((acc, property) => {
      const overwrites = _try(() => this.state.INTEGRATION_Preferences[this.props.integrationName][this.props.resourceName][property], {});
      acc[property] = initialData[property] || overwrites.initial || '';
      return acc;
    }, {}));

    validate(this.state.name, key, this.validate);
  }
  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, key, this.props.forms[this.state.name][key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  validate = (values) => {
    return {};
  }

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
      <div className="floating-labels components_forms_integrationManager row">
        {
          Object.keys(this.props.resource.properties || {}).map((propertyName) => {
            const overwrites = _try(() => this.state.INTEGRATION_Preferences[this.props.integrationName][this.props.resourceName][propertyName], {});
            if (overwrites.hide) return null;
            const field = {
              name: propertyName,
              label: propertyName,
              fieldType: _setDefaultFieldType(this.props.resource.properties[propertyName]),
              ...overwrites,
            };
            
            return (
              <Components.forms.components.dynamicfield
                field={field}
                fieldKey={field.name}
                form={_try(() => this.props.forms[this.state.name][this.props.formKey || 'default'])}
                formAction={this.standardFormAction}
              />
            );
          })
        }
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_integrationManager);

// Internal Helper Functions ...
function _setDefaultFieldType(fieldType) {
  switch (fieldType) {
    case 'string':
    case 'date':
    case 'number':
    case 'options':
    case 'reference':
      return fieldType;
    default:
      return 'string';
  }
}