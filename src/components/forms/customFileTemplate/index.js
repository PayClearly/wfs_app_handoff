import { connect, Component, bindActionCreators, Fragment } from 'component';
import axios from 'axios';

import { Collapse } from 'react-collapse';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => ({
  ...bindActionCreators(Store.forms, dispatch),
});

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_forms_customFileTemplate extends Component {

  state = {
    name: 'Components.forms.customFileTemplate',
    key: 'default',
    childFormName: 'Components.forms.customFileField',
  };

  componentDidMount() {
    const { initialize, validate, initialData = [] } = this.props;
    initialize(this.state.name, this.state.key, {
      fields: _formatInitialData(initialData),
      fileType: initialData.fileType || null,
    });

    validate(this.state.name, this.state.key, this.validate);
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  onDrop = (files) => {
    return _parseDroppedFileData(files[0])
      .then((data = []) => {
        if (data.length > 0) {
          this.standardFormAction('change', {
            fields: data,
            fileType: files[0].fileType,
          });
        }
      });
  }

  standardFormAction = (action, field, value) => {
    const { name, key } = this.state;
    if (action === 'change') {
      this.props[action](name, key, field, value);
      this.props.validate(name, key, this.validate);
    } else {
      this.props[action](name, key, field);
    }
  };

  validate = (values = {}) => {
    const errors = {};
    if (values.fields && values.fields.length > 1) {
      const formValues = values.fields.map(({ key }) => {
        return _try(() => this.props.forms[this.state.childFormName][key]._values, {});
      });

      const duplicates = _checkForDuplicates(formValues, this.props.mode);

      if (duplicates && duplicates.length) {
        if (this.props.mode === 'download') {
          errors.fields = `Download template may not have duplicate header names: ${duplicates}`;
        }

        if (this.props.mode === 'upload') {
          errors.fields = `Upload template may not have duplicate {CHANGE_ME_COMPANY_NAME} Field names: ${duplicates}`;
        }
      }
    }

    return errors;
  };

  addField = (e) => {
    e.preventDefault();
    const keys = this.props.forms[this.state.name][this.state.key].fields.value;
    keys.push({ key: Date.now() });
    this.standardFormAction('change', 'fields', keys);
  }

  removeField = (key) => {
    const keys = this.props.forms[this.state.name][this.state.key].fields.value.filter(field => field.key !== key);
    this.standardFormAction('change', 'fields', keys);
  }

  renderFields = () => {
    const fields = _try(() => this.props.forms[this.state.name][this.state.key]._values.fields, []);
    if (!fields.length) return null;

    return fields.map(field => (
      <div className="row mb-0">
        <div className="col-12">
          <Components.forms.customFileField
            mode={this.props.mode}
            formKey={field.key}
            initialData={field}
            removeField={this.removeField}
            parentFormKey={this.state.key}
            parentFormName={this.state.name}
            parentValidate={() => this.props.validate(this.state.name, this.state.key, this.validate)}
          />
        </div>
      </div>
    ));
  }

  render() {
    const { mode, forms } = this.props;
    const form = _try(() => forms[this.state.name][this.state.key]);
    if (!form) return null;

    const inProgress = !!_try(() => form._values.fields.length);

    return (
      <form className="components_forms_customFileTemplate floating-labels">
        <Collapse isOpened={form.fields?.error}>
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Invalid Form</h4>
            Error: {form.fields?.error}
          </div>
        </Collapse>
        {
          inProgress &&
          <div className="row">
            <div className="col-6">
              <h4>Field Name
                <Components.tooltip className="d-inline ms-2">
                  <i className="mdi mdi-help-circle-outline" />
                  <div>
                    <p>Field names on your {mode}ed file.</p>
                    <p>If the uploaded file does not have headers, use &apos;COLUMN_#&apos; to specify a column number (starting at 1 for the first column). i.e.: COLUMN_1</p>
                    <p>Add &apos;?format=&apos; after the field name for formatting. Accepted formats include: cents, caps. i.e.: amount?format=cents</p>
                  </div>
                </Components.tooltip>
              </h4>
            </div>
            <div className="col-5">
              <h4>{this.props.providerTheme.displayName} Field Name
                <Components.tooltip className="d-inline ms-2">
                  <i className="mdi mdi-help-circle-outline" />
                  <div>{this.props.providerTheme.displayName} field names associated with the payment</div>
                </Components.tooltip>
              </h4>
            </div>
          </div>
        }
        {this.renderFields()}
        <Components.button
          buttonText="Add a Field"
          onClick={this.addField}
          className="btn btn-outline-primary w-100 mb-4"
          icon="pe-1 mdi mdi-plus-circle"
          iconLeft
        />
        <Collapse isOpened={!inProgress}>
          <Components.dropzone
            onDrop={this.onDrop}
            instructions={<h5>Upload a supported <b>csv</b> file or start creating your fields manually</h5>}
            featureName="field"
            accept="text/csv,.csv"
          />
        </Collapse>

      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_customFileTemplate);

// Internal Helper Functions ...
const _parseDroppedFileData = (file) => {
  return new Promise((resolve, reject) => {
    return axios.get(file.preview)
      .then(({ data }) => {
        const fields = _try(() => data.split('\r')[0].split(',').filter(n => !!n), []);
        resolve(fields.map((field, index) => ({ key: index, fieldName: _scrub(field) })));
      })
      .catch(reject);
  });

};

const _scrub = (word) => {
  return word.split('').filter(l => l !== '"').join('').split('\r')[0];
};

const _formatInitialData = (initialData) => {
  if (!initialData.length) return [];

  return initialData.map((field, index) => {
    return {
      key: index,
      ...field,
    };
  });
};

const _checkForDuplicates = (values = [], mode) => {
  if (!mode) {
    return '';
  }

  const duplicates = [];

  values.reduce((acc, { fieldName, pcField }) => {
    if (mode === 'download') {
      if (fieldName) {
        if (!acc[fieldName]) {
          acc[fieldName] = true;
        } else {
          duplicates.push(fieldName);
        }
      }

      return acc;
    }

    if (mode === 'upload') {
      if (pcField) {
        if (!acc[pcField]) {
          acc[pcField] = true;
        } else {
          duplicates.push(pcField);
        }
      }

      return acc;
    }

    return acc;
  }, {});

  return duplicates.join(', ');
};

