import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    erpIntegration: _try(() => Selectors.integrations(state).erpIntegration, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createERPVendor: (data) => {
      dispatch(Store.account.createErpIntegrationVendor(data));
    },
    ...bindActionCreators(Store.forms, dispatch),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_forms_erpFields extends Component {

  state = {
    name: 'Components.forms.erpFields',
  };

  componentDidMount() {
    const {
      initialize,
      initialData = {},
    } = this.props;
    const key = this.props.formKey || this.state.key;
    this.setState({ key });

    initialize(this.state.name, key, {
      erpVendor: initialData.erpVendor || null,
      erpClass: initialData.erpClass || null,
      erpCategory: initialData.erpCategory || null,
      erpAccount: initialData.erpAccount || null,
    });
  }


  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  erpVendorCreate = (name) => {
    if (this.props.erpIntegration.status.updating) return;
    this.props.createERPVendor({ name });
  };

  standardFormAction = (action, field, value) => {

    const fields = (typeof field === 'object') && field || {
      [field]: value,
    };

    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, fields);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  render() {
    const form = _try(() => this.props.forms[this.state.name][this.state.key], null);
    if (!form || !this.props.isShowing) return null;

    const overrideForm = _try(() => this.props.forms[this.state.name]['erpFields-override']);
    return (
      <div className="floating-labels components_forms_erpFields">
        {!this.props.hideTypeAheads &&
          <div className="row pt-2">
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.referenceinput
                form={form}
                field="erpVendor"
                action={this.standardFormAction}
                label="ERP Vendor"
                disabled={this.props.creating}
                overRidden={(this.state.key !== 'erpFields-override' && _try(() => overrideForm._values.erpVendor) && atob(overrideForm._values.erpVendor))}
                hideError={!form.erpVendor.touched}
                refPath="account.erpIntegration.data.resources.vendors"
                refKey="name"
                noItemsText={(this.props.erpIntegration.status.updating) ? 'Creating...' : `Create this Vendor in ${this.props.erpIntegration.providerInfo.name}`}
                noItemsClicked={(e, text) => {
                  this.erpVendorCreate(text);
                }}
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.referenceinput
                form={form}
                field="erpCategory"
                action={this.standardFormAction}
                label="ERP Category"
                disabled={this.props.creating}
                overRidden={(this.state.key !== 'erpFields-override' && _try(() => overrideForm._values.erpCategory) && atob(overrideForm._values.erpCategory))}
                hideError={!form.erpCategory.touched}
                refPath="account.erpIntegration.data.resources.categories"
                refKey="name"
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.referenceinput
                form={form}
                field="erpClass"
                action={this.standardFormAction}
                label="ERP Class"
                disabled={this.props.creating}
                overRidden={(this.state.key !== 'erpFields-override' && _try(() => overrideForm._values.erpClass) && atob(overrideForm._values.erpClass))}
                hideError={!form.erpClass.touched}
                refPath="account.erpIntegration.data.resources.classes"
                refKey="name"
              />
            </div>
          </div>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_erpFields);


