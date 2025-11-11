import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_integrationcomps_achintegration_DWOLLA_forms_accountdocument extends Component {

  state = {
    name: 'Components.integrationcomps.achintegration.DWOLLA.forms.accountdocument',
    documentTypeOptions: {
      passport: {
        display: 'Passport',
      },
      license: {
        display: 'License',
      },
      idCard: {
        display: 'ID Card',
      },
      other: {
        display: 'Other',
      },
    },
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      documentType,
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';


    initialize(this.state.name, key, {
      documentType: documentType || '',

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

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const errors = {};
    if (!values.documentType) {
      errors.documentType = 'A document type is required';
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
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels">
        <h3 className="mb-3">Document Information</h3>
        <div className="row">
          <div className="col-12">
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="documentType"
              action={this.standardFormAction}
              label="Document Type"
              options={this.state.documentTypeOptions}
              placeholder={(this.state.documentTypeOptions[form._values.documentType] && this.state.documentTypeOptions[form._values.documentType].display) || ''}
              disabled={this.props.disabled}
              hideError={!form.documentType.touched}
              required
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col-12'}>
            <Components.dropzone
              title={'Document Upload'}
              accept={'application/pdf,image/png,image/jpeg'}
              instructions={'Click to upload or drag and drop a supported file'}
              onDrop={this.props.onDocumentDrop}
              acceptedFiles={this.props.acceptedDocuments}
              multiple={false}
              maxSize={10000000}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_forms_accountdocument);


