import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

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
  // 'invoicenumber',
  'mediatype',
  'ordernumber',
];

const mapStateToProps = (state, props) => {
  return ({
    accountId: state.account.data.id,
    forms: state.forms,
    orgId: state.organization.data.id,
    paymentCustomFieldsItem: state.account.paymentCustomFields.data.item,
    paymentCustomFieldsStatus: state.account.paymentCustomFields.status,
    policies: Selectors.entity('paymentCustomFields_idOrganization_idAccount')(state),
    paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    setCustomFields: (data) => {
      dispatch(Store.account.updatePaymentCustomFields(data));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsPaymentCustomFields());
    },
    setPreferences: (data) => {
      dispatch(Store.account.updatePaymentPipelinePreferences(data));
    },
  });
};

class components_entities_paymentcustomfields extends Component {

  state = {
    editBtnText: 'Edit Fields',
    customFields: {},
  };




  onSubmit() {
    const customFieldForms = this.props.forms['Components.forms.createcustomfield'];
    const customFields = {};
    Object.keys(customFieldForms).filter((field) => { return field.includes('paymentCustomField'); }).forEach((customFieldId) => {
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
    if (this.props.paymentPipelinePreferences.uploadTemplate || this.props.paymentPipelinePreferences.downloadTemplate) this.handleUpdatingTemplates();
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

  handleUpdatingTemplates = () => {
    const customFieldForms = this.props.forms['Components.forms.createcustomfield'];
    const pipelinePreferences = this.props.paymentPipelinePreferences;
    // Check to see if names were updated, rather than added (aka initial !== '')
    const updatedFields = Object.values(customFieldForms).filter(field => field.fieldName.intial !== '' && field.fieldName.initial !== field.fieldName.value);

    const { uploadTemplate, downloadTemplate } = updateUploadAndDownloadTemplates(updatedFields, pipelinePreferences);

    // no need to setPreferences if nothing changed in the template
    if (uploadTemplate || downloadTemplate) {
      const updatedTemplates = {
        ...(uploadTemplate && { uploadTemplate }),
        ...(downloadTemplate && { downloadTemplate }),
      };
      this.props.setPreferences({ ...updatedTemplates });
    }
  };

  handleAddCustomField = () => {
    const customFields = JSON.parse(JSON.stringify(this.state.customFields));
    const now = Date.now();
    customFields[now] = { _id: now };
    this.setState({ customFields });
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
    const propsCustomFields = Object.keys(this.props.paymentCustomFieldsItem).map((key) => {
      return (
        <div className="row">
          <div className="col-12">
            <Components.forms.createcustomfield
              formKey={`paymentCustomField-${key}`}
              fieldName={this.props.paymentCustomFieldsItem[key].name || ''}
              fieldType={this.props.paymentCustomFieldsItem[key].fieldType || ''}
              isFieldRequired={this.props.paymentCustomFieldsItem[key].required}
              options={this.props.paymentCustomFieldsItem[key].options || ''}
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
              formKey={`paymentCustomField-${key}`}
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
    if (!this.props.paymentCustomFieldsItem) return null;
    const { policies, forms, title } = this.props;
    const customFieldForms = forms['Components.forms.createcustomfield'] || {};

    const error = this.props.paymentCustomFieldsStatus.updatingError;
    const updating = this.props.paymentCustomFieldsStatus.updating;

    const hasCustomFields = Object.keys(this.props.paymentCustomFieldsItem).length > 0;

    const allCustomFieldFormsValid = Object.keys(customFieldForms).length ?
      Object.keys(customFieldForms).every((id) => {
        return customFieldForms[id]._allValid === true;
      }) : true;

    const updateDisabled = updating || !allCustomFieldFormsValid;

    return (
      <div className="mb-5">
        {title && <h3>{title}</h3>}
        <Components.entities.entitywrapper
          canRead={policies.canRead}
          canUpdate={policies.canUpdate}
          canDelete={policies.canDelete}
          onSubmit={() => this.onSubmit()}
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
          {hasCustomFields
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
                  Object.keys(this.props.paymentCustomFieldsItem || {}).map((key) => {
                    const item = this.props.paymentCustomFieldsItem[key];
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

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_paymentcustomfields);

// Internal Helper Functions ...
function updateUploadAndDownloadTemplates(updatedFields, pipelinePreferences) {
  // make a map of field names to check against upload and download template
  const updatedNames = updatedFields.reduce((acc, curr) => {
    acc[curr.fieldName.initial] = curr.fieldName.value;
    return acc;
  }, {});

  let updateUpload = false;
  let updateDownload = false;

  const uploadTemplate = pipelinePreferences.uploadTemplate && pipelinePreferences.uploadTemplate.map((field) => {
    if (field.pcField in updatedNames) {
      updateUpload = true;
      field.pcField = updatedNames[field.pcField];
    }
    return field;
  });

  const downloadTemplate = pipelinePreferences.downloadTemplate && pipelinePreferences.downloadTemplate.map((field) => {
    if (field.pcField in updatedNames) {
      updateDownload = true;
      field.pcField = updatedNames[field.pcField];
    }
    return field;
  });

  const toReturn = {
    uploadTemplate: updateUpload ? uploadTemplate : null,
    downloadTemplate: updateDownload ? downloadTemplate : null,
  };

  return toReturn;
}
