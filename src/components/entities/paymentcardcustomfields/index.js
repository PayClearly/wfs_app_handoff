import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

const RESERVED_CUSTOM_FIELDS = [
  // basic payment information
  'accountvendor',
  'amount',
  'method',
  'paymentmethod',
  'vendor',
  'vendorname',
  'agency',
  'agencyname',
  'candidate',
  'candidateid',
  'candidatename',
  'client',
  'clientid',
  'clientname',
  'flightdate',
  'flightdates',
  'mediatype',
  'ordernumber',
];

const mapStateToProps = (state, props) => {
  return ({
    accountId: state.account.data.id,
    forms: state.forms,
    orgId: state.organization.data.id,
    paymentCardCustomFieldsItem: state.account.paymentCardCustomFields.data.item,
    paymentCardCustomFieldsStatus: state.account.paymentCardCustomFields.status,
    policies: Selectors.entity('paymentCardCustomFields_idOrganization_idAccount')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    setCustomFields: (data) => {
      dispatch(Store.account.updatePaymentCardCustomFields(data));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsPaymentCardCustomFields());
    },
  });
};

class components_entities_paymentcardcustomfields extends Component {

  state = {
    editBtnText: 'Edit Fields',
    customFields: {},
  };

  onSubmit() {
    const customFieldForms = this.props.forms['Components.forms.createcustomfield'];
    const customFields = {};
    Object.keys(customFieldForms).filter(field => field.includes('pCardCustomField')).forEach((customFieldId) => {
      const fields = customFieldForms[customFieldId]._values;
      customFields[fields.fieldName] = {
        name: fields.fieldName,
        fieldType: fields.fieldType,
        required: fields.isFieldRequired,
        options: fields.hiddenOptions,
        length: fields.length,
      };
    });
    this.props.setCustomFields(customFields);
    this.setState({ customFields: {} });
  }

  onCancel = () => {
    this.setState({
      customFields: {},
    });
  };

  onElementsChanged = (data) => {
    this.setState({ elements: data });
  }
  handleAddCustomField = () => {
    const customFields = JSON.parse(JSON.stringify(this.state.customFields));
    const now = Date.now();
    customFields[now] = { _id: now };
    this.setState({
      customFields,
    });
  };

  customValidator = (values) => {
    const errors = {};
    if (values.fieldName) {
      let sanitizedFieldName = values.fieldName.toLowerCase();
      sanitizedFieldName = sanitizedFieldName.replace(/\s+/g, '');

      if (RESERVED_CUSTOM_FIELDS.includes(sanitizedFieldName)) {
        errors.fieldName = 'This name is reserved, please use another name';
      }
    }

    return errors;
  }

  renderCustomFields = () => {
    const propsCustomFields = Object.keys(this.props.paymentCardCustomFieldsItem).map((key) => {
      return (
        <div className="row">
          <div className="col-12">
            <Components.forms.createcustomfield
              formKey={`pCardCustomField-${key}`}
              fieldName={this.props.paymentCardCustomFieldsItem[key].name || ''}
              fieldType={this.props.paymentCardCustomFieldsItem[key].fieldType || ''}
              isFieldRequired={this.props.paymentCardCustomFieldsItem[key].required}
              options={this.props.paymentCardCustomFieldsItem[key].options || ''}
              customValidator={this.customValidator}
            />
          </div>
        </div>
      );
    });
    const stateCustomFields = Object.keys(this.state.customFields).map((key) => {
      return (
        <div className="row">
          <div className="col-12">
            <Components.forms.createcustomfield
              formKey={`pCardCustomField-${key}`}
              fieldName={this.state.customFields[key].name || ''}
              fieldType={this.state.customFields[key].fieldType || ''}
              isFieldRequired={this.state.customFields[key].isFieldRequired}
              options={this.state.customFields[key].options || ''}
              customValidator={this.customValidator}
            />
          </div>
        </div>
      );
    });
    return propsCustomFields.concat(stateCustomFields);
  };

  render() {
    if (!this.props.paymentCardCustomFieldsItem) return null;
    const { policies, forms } = this.props;
    const customFieldForms = forms['Components.forms.createcustomfield'] || {};

    const error = this.props.paymentCardCustomFieldsStatus.updatingError;
    const updating = this.props.paymentCardCustomFieldsStatus.updating;

    const hasCustomFields = Object.keys(this.props.paymentCardCustomFieldsItem).length > 0;

    const allCustomFieldFormsValid = Object.keys(customFieldForms).length ?
      Object.keys(customFieldForms).every((id) => {
        return customFieldForms[id]._allValid === true;
      }) : true;

    const updateDisabled = updating || !allCustomFieldFormsValid;

    return (
      <div className="mb-5">
        {this.props.title && <h3>{this.props.title}</h3>}
        <Components.entities.entitywrapper
          canRead={policies.canRead}
          canUpdate={policies.canUpdate}
          canDelete={policies.canDelete}
          onSubmit={() => { this.onSubmit(); }}
          onCancel={this.onCancel}
          clearStatusErrors={this.props.clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={(hasCustomFields) ? this.state.editBtnText : 'Add Fields'}
          wrapperClasses={'mt-3'}
          orgId={this.props.orgId}
          accountId={this.props.accountId}
        >
          {(hasCustomFields)
            ? <table className="table table-sm">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">Required</th>
                </tr>
              </thead>
              <tbody>
                {
                  Object.keys(this.props.paymentCardCustomFieldsItem || {}).map((key) => {
                    const item = this.props.paymentCardCustomFieldsItem[key];
                    return (
                      <tr>
                        <td>{item.name}</td>
                        <td>{item.fieldType}</td>
                        <td>{item.required ? 'yes' : 'no'}</td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
            : <div />}

          <form className="floating-labels">
            {this.renderCustomFields()}
            <div className="row">
              <div className="col-12">
                <Components.forms.components.button
                  disabled={Object.keys(customFieldForms).length >= 6}
                  onClick={this.handleAddCustomField}
                  buttonText="Add New Custom Field"
                  className="btn btn-outline-primary w-100 mb-4"
                  icon="pe-1 mdi mdi-plus-circle"
                />
              </div>
            </div>
          </form>
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_paymentcardcustomfields);

