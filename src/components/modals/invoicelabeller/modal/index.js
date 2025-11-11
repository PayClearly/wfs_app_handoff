import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    invoices: state.account.invoices.data.items,
    invoiceStatus: state.account.invoices.status,
    forms: state.forms,
    derivedFormData: _try(() => Selectors.paymentform(props.id)(state), {}),
    // derived: _try(() => Selectors.invoiceform(props.id)(state), null),
    paymentStatus: state.account.paymentStatuses.status,
    instantTransfer: _try(() => Selectors.funding(state).instantTransfer, {}),
    annotationsStatus: state.account.annotations.status,
    annotations: state.account.annotations.data.items,
  });
};

const mapDispatchToProps = {
  updateInvoice: Store.account.updateInvoice,
  updateAnnotation: Store.account.updateAnnotation,
  syncAnnotation: Store.account.getAnnotation,
  clear: Store.account.clearAnnotation,
  create: Store.account.createPayments,
  ...Store.forms,
};

class components_modals_invoicelabeller_modal extends Component {

  state = {
    paymentFormActive: false,
    formName: 'Components.forms.invoicedetails',
    closing: false,
    nexting: false,
    lines: [],
  }


  componentDidMount() {
    // Get annotations for invoice
    this.props.syncAnnotation(this.props.id);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.invoiceStatus.updating && nextProps.invoiceStatus.updated && !nextProps.invoiceStatus.updating) {
      if (this.state.closing) this.props.close();
      else if (this.state.nexting) this.setState({ paymentFormActive: true, nexting: false });
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.annotationsStatus.fetching && this.props.annotationsStatus.fetched && !this.state.annotations) {
      this.setState({ lines: this.props.annotations.lines });
    }

    // if there is a payment form, aka from create vendor modal, go to payment form
    if (_try(() => prevProps.forms['Components.forms.payment'][prevProps.id]) && !this.state.paymentFormActive) {
      this.setState({ paymentFormActive: true });
    }
  }
  componentWillUnmount() {
    this.props.destroy(this.state.formName, this.props.id);
    this.props.clear();
  }

  save = (submit) => {
    const { id, forms } = this.props;
    const form = _try(() => forms['Components.forms.invoicedetails'][id], {});
    if (!form._allInitial) {
      const data = form._values || {};
      data.id = id;

      this.props.updateInvoice(data);
      this.props.updateAnnotation({ id, lines: this.state.lines });
    }
  }

  on = {
    submit: () => {
      const { id, forms } = this.props;
      const form = _try(() => forms['Components.forms.invoicedetails'][id], {});
      if (!form._allInitial) {
        this.save();
        this.setState({ nexting: true });
      } else this.setState({ paymentFormActive: true, nexting: false });
    },
    saveAndClose: () => {
      const { id, forms } = this.props;
      const form = _try(() => forms['Components.forms.invoicedetails'][id], {});
      if (!form._allInitial) {
        this.save();
        this.setState({ closing: true });
      } else this.props.close();
    },
    back: () => {
      this.setState({ paymentFormActive: false });
    },
    createPayable: () => {
      this.props.create([this.props.derivedFormData.adapted], this.props.instantTransfer, this.props.id);
    },
    disabledClick: (formName) => {
      this.props.blur(formName, this.props.id, this.props.forms[formName][this.props.id]._values);

      if (this.props.instantFundingCreateDisabled) {
        this.setState({ disabledClick: true });
      }
    },
    labelClick: (value, text, index) => {
      const fields = {};
      const isDate = value === 'invoiceDate' || value === 'dueDate';
      fields[value] = isDate ? new Date(text) : text;
      this.props.change(this.state.formName, this.props.id, fields);
      this.props.blur(this.state.formName, this.props.id, fields);
      this.props.validate(this.state.formName, this.props.id, this.validate);

      const newLines = [...this.state.lines];

      // erase previous labelled line
      const toErase = newLines.find(line => line.label === value);
      if (toErase) toErase.label = '';

      // assign new label to line
      newLines[index].label = value;

      this.setState({ lines: newLines });
    },
  }

  validate = (fields) => {
    const { types } = this.props;
    const errors = {};

    if (fields.invoiceDate && !Date.parse(fields.invoiceDate)) {
      errors.invoiceDate = 'Invalid Date';
    }
    if (fields.dueDate && !Date.parse(fields.dueDate)) {
      errors.dueDate = 'Invalid Date';
    }
    // vendor
    if (!fields.vendorName) {
      errors.vendorName = 'Vendor name is required';
    }
    if (!fields.invoiceNumber) {
      errors.invoiceNumber = 'Invoice Number is required';
    }
    if (!fields.amount) {
      errors.amount = 'Amount is required';
    }
    if (!fields.dueDate) {
      errors.dueDate = 'Due Date is required';
    }
    return errors;
  }


  render() {
    const { id, invoices, forms, paymentStatus, invoiceStatus, annotationsStatus } = this.props;
    const { paymentFormActive } = this.state;
    const invoice = invoices[id];
    const error = invoiceStatus.updatingError || annotationsStatus.updatingError;

    return (
      <div className="modal-dialog wide-modal wide-90" role="document">
        <div className="modal-content components_modals_invoicelabeller">
          <div className="modal-header">
            {
              paymentFormActive
                ? <h3 className="modal-title" style={{ cursor: 'pointer' }} onClick={this.on.back} id="back"><i className="mdi mdi-arrow-left" /> Back to Invoice Details</h3>
                : <h3 className="modal-title" id="exampleModalLabel">Invoice Details</h3>
            }
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-1">
                <Components.modals.invoicelabeller.components.sidebar invoice={invoice} onBack={this.on.back} />
              </div>

              {
                this.state.paymentFormActive
                  ? <div className="col-11 border-left">
                    <Components.creators.invoicepayable formKey={id} handleClose={this.props.close} />
                  </div>

                  : <Fragment>
                    <div className="col-6 border-left border-right">
                      <Components.modals.invoicelabeller.components.overlay invoice={invoice} handleClick={this.on.labelClick} lines={this.state.lines} />
                    </div>
                    <div className="col-5">
                      <Components.modals.invoicelabeller.components.details invoice={invoice} />
                    </div>
                  </Fragment>
              }
            </div>

          </div>
          <div className="modal-footer">
            {error &&
              <div className="alert flex-fill alert-danger mb-0" role="alert">
                <h4 className="d-inline alert-heading pe-3">Something Went Wrong</h4>
                <span>Error: {error}</span>
              </div>
            }
            {
              paymentFormActive
                ? <Components.button
                  buttonText="Back"
                  onClick={this.on.back}
                  className="btn btn-secondary"
                  aria-label="back button"
                  icon="mdi mdi-arrow-left"
                  iconLeft
                  updating={paymentStatus.updating}
                  disabled={paymentStatus.updating}
                />
                : <Components.button
                  buttonText="Save and Close"
                  onClick={this.on.saveAndClose}
                  className="btn btn-secondary"
                  aria-label="close button"
                  updating={invoiceStatus.updating && this.state.closing}
                  disabled={invoiceStatus.updating || _try(() => forms['Components.forms.invoicedetails'][id]._allInitial || !_try(() => forms['Components.forms.invoicedetails'][id]._allValid))}
                />
            }

            {
              paymentFormActive
                ? <Components.button
                  buttonText="Create Payment"
                  onClick={this.on.createPayable}
                  className="btn btn-primary"
                  aria-label="submit button"
                  onDisabledClick={() => this.on.disabledClick('Components.forms.payment')}
                  updating={paymentStatus.creating}
                  disabled={paymentStatus.creating || !_try(() => this.props.derivedFormData.valid) || this.props.instantFundingCreateDisabled}
                />
                : <Components.button
                  buttonText="Next: Create Payment"
                  onClick={this.on.submit}
                  className="btn btn-primary"
                  aria-label="submit button"
                  disabled={!_try(() => forms['Components.forms.invoicedetails'][id]._allValid)}
                  onDisabledClick={() => this.on.disabledClick('Components.forms.invoicedetails')}
                  icon="mdi mdi-arrow-right"
                  updating={invoiceStatus.updating && this.state.nexting}
                  iconRight
                />
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_invoicelabeller_modal);


