import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    derived: _try(() => Selectors.uploaders.clientVendorLinkForm(Utils.getFormKey(props))(state), null),
    form: _try(() => state.forms['Components.forms.clientVendorLink'][Utils.getFormKey(props)], {}),
    types: state.validations.data.item,
    clientVendorLinks: _resolve(state, 'account.clientVendorLinks.data.items', {}),
    globalTaggedItems: Selectors.globalTaggedItems(state),
    accountVendors: Selectors.accountVendors(state).active,
    clientsData: _resolve(state, 'account.clients.data.items', {}),
    clientsCollections: _resolve(state, 'account.clients.collections', {}),
    accountVendorNamesToIds: Selectors.accountVendorNamesToIds(state),
    defaultTag: _resolve(state, 'account.paymentPipelinePreferences.data.item.defalutGlobalVendorTagId'),
    standardCredentialFields: _resolve(state, 'global.standardCredentialFields.data.items', {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    ...bindActionCreators(Store.forms, dispatch),
    openModal: (name, data) => {
      dispatch(Store.router.openModal(name, data));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_forms_clientVendorLink extends Component {

  state = {
    name: 'Components.forms.clientVendorLink',
  }

  componentDidMount() {
    const { initialize, validate, blurOnInit } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const initialData = this.props.initialData || {};

    const formInitData = {
      vendorId: initialData.vendorId || (initialData.vendorName && this.props.accountVendorNamesToIds[initialData.vendorName]) || undefined,
      vendorName: initialData.vendorName || (initialData.vendorId ? this.props.accountVendors[initialData.vendorId].name : ''),
      clientId: initialData.clientId || (initialData.clientName && _try(() => this.props.clientsData[this.props.clientsCollections.names[initialData.clientName][0]]._id)) || undefined,
      clientName: initialData.clientName || (initialData.clientId ? _try(() => this.props.clientsData[this.props.clientsCollections._ids[initialData.clientId][0]].name) : ''),
    };

    initialize(this.state.name, key, formInitData);
    validate(this.state.name, key, this.validate);

    if (_try(() => this.props.parent.formName && this.props.parent.formKey)) {
      this.props.addChild(this.props.parent.formName, this.props.parent.formKey, this.state.name, key);
    }

    if (blurOnInit) {
      this.props.blur(this.state.name, Utils.getFormKey(this.props), formInitData);
    }
  }
  componentDidUpdate(prevProps = {}) {
    if (_try(() => prevProps.accountVendorNamesToIds[prevProps.derived.form._values.vendorName]) !== _try(() => this.props.accountVendorNamesToIds[prevProps.derived.form._values.vendorName])) {
      // run standardFormAction if we create a vendor in order to assign correct id
      this.standardFormAction('change', 'vendorName', prevProps.derived.form._values.vendorName);
    }

    if (_try(() => prevProps.clientsData[prevProps.clientsCollections.names[prevProps.derived.form._values.clientName][0]]._id) !== _try(() => this.props.clientsData[this.props.clientsCollections.names[prevProps.derived.form._values.clientName][0]]._id)) {
      // run standardFormAction if we create a client in order to assign correct id
      this.standardFormAction('change', 'clientName', prevProps.derived.form._values.clientName);
    }

    if (!prevProps.blurAll && this.props.blurAll === true) {
      this.props.blur(this.state.name, Utils.getFormKey(this.props), this.props.form._values);
    }
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, Utils.getFormKey(this.props));
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      const fields = {};
      fields[field] = value;

      if (field === 'vendorName') {
        fields.vendorId = this.props.accountVendorNamesToIds[value];
      }
      if (field === 'clientName') {
        fields.clientId = _try(() => this.props.clientsData[this.props.clientsCollections.names[value][0]]._id);
      }

      this.props[action](this.state.name, Utils.getFormKey(this.props), fields);
      this.props.validate(this.state.name, Utils.getFormKey(this.props), this.validate);
    } else {
      this.props[action](this.state.name, Utils.getFormKey(this.props), field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const errors = {};

    if (!values.vendorId) errors.vendorName = 'A valid vendor is required';
    if (!values.clientId) errors.clientName = 'A valid client is required';

    return errors;
  };

  render() {
    const { form, initialData = {}, accountVendors, globalTaggedItems, defaultTag, hideComponents } = this.props;
    if (!form._key) return null;
    const forUpdate = !!initialData.clientId;

    let schemaFields;
    const accountVendor = _try(() => accountVendors[form._values.vendorId || initialData.vendorId], {});
    const globalVendorId = accountVendor.linkedWithPayClearlyVendorId;
    if (globalVendorId && defaultTag && form._values.clientId) {
      const credentialSchema = _try(() => globalTaggedItems.vendors[globalVendorId].tags[defaultTag].vCard.credentialSchema);
      if (credentialSchema) schemaFields = credentialSchema.fields;
    }

    return (
      <Fragment>
        <form className="components_forms_clientVendorLink floating-labels">
          <div className="row">
            {!hideComponents &&
              <div className="col-12 col-md">
                <Components.forms.components.typeahead
                  form={form}
                  field="clientName"
                  action={this.standardFormAction}
                  label="Client"
                  options={Object.values(this.props.clientsData || {})}
                  labelKey="name"
                  noItemsText={'Click to Create Client'}
                  noItemsClicked={(e, text) => this.props.openModal('Components.modals.createClient', { text })}
                  disabled={forUpdate}
                  hideError={_try(() => !form.clientName.touched)}
                  alwaysShowNoItemsOption
                  highlightOnlyResult
                />
              </div>
            }
            {!hideComponents &&
              <div className="col-12 col-md">
                <Components.forms.components.typeahead
                  form={form}
                  field="vendorName"
                  action={this.standardFormAction}
                  label="Vendor"
                  options={Object.values(accountVendors || {})}
                  labelKey="name"
                  noItemsText={'Click to Create Vendor'}
                  noItemsClicked={(e, text) => this.props.openModal('Components.modals.createaccountvendor', { text })}
                  disabled={forUpdate}
                  hideError={_try(() => !form.vendorName.touched)}
                  alwaysShowNoItemsOption
                  highlightOnlyResult
                />
              </div>
            }
          </div>
        </form>
        {schemaFields &&
          <Fragment>
            <h4 className="mb-3">Credentials</h4>
            <Components.forms.credentials
              initialData={initialData.credentials}
              credentialSchemaFields={schemaFields}
              formKey={Utils.getFormKey(this.props)}
              disabled={this.props.disabled}
              blurAll={this.props.blurAll}
              blurOnInit={this.props.blurOnInit}
            />
          </Fragment>
        }
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_clientVendorLink);


