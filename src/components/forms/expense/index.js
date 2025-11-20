import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import Dropzone from 'react-dropzone';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
    availableExpenseReports: _try(() => Selectors.expenses(state).availableExpenseReports, []),
    expenseReports: _try(() => Selectors.tableData.expenseReports(state).items, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    ...bindActionCreators(Store.forms, dispatch),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_forms_expense extends Component {

  state = {
    name: 'Components.forms.expense',
  }

  componentDidMount() {
    const { initialize, validate, expenseReports } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const initialData = this.props.initialData || {};

    initialize(this.state.name, key, {
      vendor: initialData.vendor || '',
      amount: initialData.amount || '',
      currency: initialData.currency || 'USD',
      date: initialData.date ? new Date(initialData.date) : '',
      personal: initialData.personal || false,
      category: initialData.category || '',
      reportId: initialData.reportId || '',
      reportDescription: initialData.reportId ? _try(() => expenseReports[initialData.reportId].description, '') : '',
      memo: initialData.memo || '',
      reimbursable: initialData.reimbursable || true,
      receipt: initialData.receipt || undefined,
    });
    validate(this.state.name, key, this.validate);

    if (_try(() => this.props.parent.formName && this.props.parent.formKey)) {
      this.props.addChild(this.props.parent.formName, this.props.parent.formKey, this.state.name, key);
    }
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

  removeUpload = () => {
    this.standardFormAction('change', 'receipt', undefined);
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      const fields = {};
      fields[field] = value;

      if (field === 'reportDescription') {
        if (value.includes('(E_') && value[value.length - 1] === ')') {
          const unformattedRef = value.split('E_')[1];
          const ref = _try(() => parseInt(unformattedRef.split(')')[0], 10), 0);
          const report = this.props.availableExpenseReports.find((availableReport) => {
            return availableReport._ref === ref;
          });
          fields.reportId = _try(() => report._id, '');
        } else {
          fields.reportId = '';
        }
      }
      this.props[action](this.state.name, this.state.key, fields);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const errors = {};

    if (!values.vendor) errors.vendor = 'Field is required';
    if (!values.amount) errors.amount = 'Field is required';
    if (!values.date) errors.date = 'Field is required';

    if (values.reportDescription && !values.reportId) errors.reportDescription = 'Please select a valid report';

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="components_forms_expense floating-labels">
        <div className="row">
          <div className="col-12 col-md-6">
            <div className="row">
              <div className="col-12">
                <Components.forms.components.textinput
                  form={form}
                  type="text"
                  field="vendor"
                  action={this.standardFormAction}
                  label="Vendor"
                  disabled={this.props.disabled}
                  hideError={!form.vendor.touched}
                  required
                />
              </div>
              <div className="col-12 col-md-10">
                <Components.forms.components.maskedinput
                  form={form}
                  maskPlaceholder=""
                  type="string"
                  field="amount"
                  useNumberMask
                  action={this.standardFormAction}
                  label="Amount"
                  disabled={this.props.disabled}
                  hideError={_try(() => !form.amount.touched)}
                  required
                />
              </div>
              <div className="col-12 col-md-2">
                <Components.forms.components.selectinput
                  form={form}
                  field="currency"
                  action={this.standardFormAction}
                  label="Currency"
                  options={{
                    USD: { display: 'USD' },
                  }}
                  disabled={this.props.disabled}
                  hideError={_try(() => !form.currency.touched)}
                />
              </div>
              <div className="col-12">
                <Components.forms.components.daypicker
                  form={form}
                  type="number"
                  field="date"
                  action={this.standardFormAction}
                  label="Date"
                  hideError={!form.date.touched}
                  required
                />
              </div>
              <div className="col-12">
                <Components.forms.components.checkbox
                  form={form}
                  field="reimbursable"
                  action={this.standardFormAction}
                  label="Reimbursable"
                  disabled={this.props.disabled}
                  hideError={_try(() => !form.reimbursable.touched)}
                />
              </div>
              {/* <div className="col-12">
                <Components.forms.components.checkbox
                  form={form}
                  field="personal"
                  action={this.standardFormAction}
                  label="Personal"
                  disabled={this.props.disabled}
                  hideError={_try(() => !form.personal.touched)}
                />
              </div> */}
              <div className="col-12">
                <Components.forms.components.textinput
                  form={form}
                  type="text"
                  field="category"
                  action={this.standardFormAction}
                  label="Category"
                  disabled={this.props.disabled}
                  hideError={!form.category.touched}
                />
              </div>
              <div className="col-12">
                <Components.forms.components.typeahead
                  form={form}
                  field="reportDescription"
                  action={this.standardFormAction}
                  label="Report"
                  options={this.props.availableExpenseReports.filter(report => !report.deleted)}
                  labelKey="description"
                  disabled={this.props.disabled}
                  hideError={!form.reportDescription.touched}
                />
              </div>
              <div className="col-12">
                <Components.forms.components.textArea
                  form={form}
                  type="text"
                  field="memo"
                  action={this.standardFormAction}
                  label="Memo"
                  disabled={this.props.disabled}
                  hideError={!form.memo.touched}
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            {_try(() => form.receipt.value.storagePath) &&
              <div className="card d-flex justify-content-center align-items-center border-primary" style={{ minHeight: '75px' }}>
                {(() => {
                  if (form.receipt.value.contentType.includes('image')) {
                    return (
                      <Components.containers.image
                        alt={`attachment ${form.receipt.value.originalname}`}
                        path={form.receipt.value.storagePath}
                        thumbnail={false}
                        hash={form.receipt.value.md5Hash}
                      />
                    );
                  }
                  if (form.receipt.value.contentType.includes('pdf')) {
                    return (
                      <Components.containers.pdf
                        pdf={form.receipt.value}
                        hidePagination
                      />
                    );
                  }
                  return (
                    <Components.mimeicon
                      contentType={form.receipt.value.contentType}
                    />
                  );
                })()}
                <div
                  className="btn-group w-100"
                >
                  <Components.button
                    buttonText=""
                    onClick={() => { this.removeUpload(); }}
                    ariaLabel="Remove Current Upload"
                    className="btn btn-primary border-radius-0 w-50"
                    icon="mdi mdi-delete mdi-24px"
                  />
                  <Dropzone
                    onDrop={(files) => {
                      this.standardFormAction('change', 'receipt', files);
                    }}
                    accept={'application/pdf, image/jpeg, image/png'}
                    multiple={false}
                    maxSize={Infinity}
                    className="components_button btn btn-primary border-radius-0 w-50"
                  >
                    <i className="mdi mdi-cloud-upload mdi-24px" />
                  </Dropzone>
                </div>
              </div>
            }
            {!_try(() => form.receipt.value.storagePath) &&
              <Fragment>
                <Components.dropzone
                  title={'Upload Receipt'}
                  accept={'application/pdf, image/jpeg, image/png'}
                  instructions={'Click to upload or drag and drop a supported file(s)'}
                  onDrop={(files) => {
                    this.standardFormAction('change', 'receipt', files);
                  }}
                  acceptedFiles={_try(() => form.receipt.value)}
                  fullSizeImagePreviews
                  multiple={false}
                />
                {_try(() => form.receipt.value) &&
                  <Components.button
                    buttonText="Remove Upload"
                    onClick={() => { this.removeUpload(); }}
                    ariaLabel="Remove Current Upload"
                    className="btn btn-secondary btn-outline"
                    icon="mdi mdi-delete"
                  />
                }
              </Fragment>
            }
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_expense);


