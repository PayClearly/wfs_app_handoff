/* eslint-disable react/jsx-pascal-case */
import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonText, IonButton, IonIcon, IonItem, IonList, IonLabel, IonCheckbox, IonListHeader, IonActionSheet, IonNote } from '@ionic/react';
import { receipt } from 'ionicons/icons';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
    updating: state.account.expenses.status.updating,
    creating: state.account.expenses.status.creating,
    photo: _resolve(state, 'device.camera.data.photo.webPath'),
    photoStatus: _resolve(state, 'device.camera.status'),
    submittedExpenseReports: Selectors.expenses(state).submittedExpenseReports,
    availableExpenseReports: Selectors.expenses(state).availableExpenseReports,
    trips: Selectors.trips(state),
    adhocTrips: Selectors.adhocTrips(state),
    device: state.device.data,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
    takePhoto: () => {
      dispatch(Store.device.takePhoto());
    },
    choosePhoto: () => {
      dispatch(Store.device.choosePhoto());
    },
    openCategoryModal: (form, action, options) => {
      dispatch(Store.router.openModal('Components.ionic.modals.expenseCategory', { form, action, animation: 'slideUp', options }));
    },
    openReceiptModal: (form, action, isSubmitted, options) => {
      dispatch(Store.router.openModal('Components.ionic.modals.receipt', { form, action, animation: 'slideUp', options, isSubmitted }));
    },
    ...bindActionCreators(Store.forms, dispatch),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_forms_expense extends Component {
  state = {
    name: 'Components.ionic.forms.expense',
    forUpdate: false,
    showReceiptActionSheet: false,
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const initialFormData = this.props.initialFormData || {};
    const formKey = this.props.formKey || 'default';
    initialize(this.state.name, formKey, {
      amount: initialFormData.amount || '',
      currency: initialFormData.currency || 'USD',
      date: initialFormData.date || Date.now(),
      vendor: initialFormData.vendor || '',
      personal: initialFormData.personal || false,
      reimbursable: initialFormData.reimbursable || true,
      reportId: initialFormData.reportId || null,
      category: initialFormData.category || '',
      memo: initialFormData.memo || '',
      receipt: initialFormData.receipt || null,
      source: initialFormData.source || 'manual',
      sourceId: initialFormData.sourceId || null,
      tripNumber: initialFormData.tripNumber || '',
    });
    validate(this.state.name, formKey, this.validate);
    const receiptFirst = initialFormData.receiptFirst || false;
    delete initialFormData.receiptFirst;
    this.setState({ key: formKey, forUpdate: !!Object.keys(initialFormData).length });

    if (receiptFirst) this.props.takePhoto();
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || 'default'],
      key: nextProps.formKey || 'default',
    });
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.photoStatus.submitting && !this.props.photoStatus.submitting && this.props.photoStatus.submitted && this.props.photo) {
      this.standardFormAction('change', 'receipt', this.props.photo);
    }
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
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
    
    if (!values.amount) {
      errors.amount = 'Amount is required';
    }
    if (!values.merchant) {
      errors.merchant = 'Merchant is required';
    }

    return errors;
  };

  handleReceiptClick = (submittedReport) => {
    const receipt = _resolve(this.state, 'form.receipt.value', undefined);
    if (!receipt) this.setState({ showReceiptActionSheet: true });
    else this.props.openReceiptModal(this.state.form, this.standardFormAction, submittedReport);
  }

  render() {
    const { form } = this.state;
    if (!form) return null;

    const currencyOptions = [{
      label: 'USD',
      value: 'USD',
    }];

    const categories = {
      1: 'Maintenance',
      2: 'Fuel',
      3: 'Terminal Fuel',
      A: 'Automobile / Vehicle Rental',
      C: 'Cash Disbursements',
      F: 'Restaurant (Food)',
      H: 'Hotel / Motel / Cruise-Ship',
      O: 'College / School Expense / Hospital',
      R: 'Card Activated Terminals / Retail Sales',
      T: 'Pre-Authorized Transactions / Mail / Telephone / E-Commerce',
      U: 'Unique Transactions / Card Activated Terminals at Truck Stop',
      X: 'Passenger Transportation',
    };
    const categoryOptions = Object.keys(categories).map(key => ({ label: categories[key], value: key }));
    const submittedReport = this.props.submittedExpenseReports.find(report => form._values.reportId === report._id);
    let reportOptions = submittedReport ? [{ label: submittedReport.name, value: submittedReport._id }] : (this.props.availableExpenseReports || []).map(report => ({ label: report.name, value: report._id }));
    const reportsAvailable = reportOptions.length !== 0;
    if (!reportsAvailable) {
      reportOptions = [{ label: 'No Reports Available', value: null }]
    } else {
      reportOptions.unshift({ label: '(unassigned)', value: null });
    }

    const tripsAvailable = Object.keys(this.props.trips).length > 0 || Object.keys(this.props.adhocTrips).length > 0;
    let tripOptions = [{ label: 'No Trips Available', value: null}];
    if (tripsAvailable) {
      tripOptions = Object.values({ ...this.props.trips, ...this.props.adhocTrips }).map(trip => ({ label: trip.id, value: trip.id }));
      tripOptions.unshift({ label: '(unassigned)', value: null });
    }

    const inProgress = this.props.updating || this.props.creating;
    const readonly = submittedReport;
    return (
      <form className="components_ionic_forms_expense ion-margin" onSubmit={this.props.onSubmit}>
        {(!submittedReport || form.receipt.value) &&
          <IonButton onClick={() => this.handleReceiptClick(submittedReport)} className="add-receipt-button" strong fill="outline" expand="block" color="light">
            <IonIcon slot="start" icon={receipt} />
            <IonText>{ form.receipt.value ? 'VIEW' : 'ADD' } RECEIPT</IonText>
          </IonButton>
        }
        <IonActionSheet
          isOpen={this.state.showReceiptActionSheet}
          onDidDismiss={() => this.setState({ showReceiptActionSheet: false })}
          buttons={[{
            text: 'Camera',
            handler: this.props.takePhoto,
          }, {
            text: 'From Photo Library',
            handler: this.props.choosePhoto,
          }, {
            text: 'Uploaded Receipts',
            handler: () => {
              return null;
            },
          }, this.props.device.platform === 'ios' || this.props.device.model === 'iPhone' ? {
            text: 'Cancel',
            cssClass: 'light',
            role: 'cancel',
          }
          :
          {
            text: 'Cancel',
            role: 'cancel',
          }]}
        />
        <IonList>
          <Components.ionic.forms.components.textinput
            form={form}
            type="number"
            inputmode="decimal"
            placeholder="$0.00"
            field="amount"
            action={this.standardFormAction}
            label="Amount"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.amount.touched}
          />
          <Components.ionic.forms.components.select
            form={form}
            field="currency"
            options={currencyOptions}
            action={this.standardFormAction}
            label="Currency"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.currency.touched}
          />
          <Components.ionic.forms.components.datepicker 
            form={form}
            field="date"
            max={(new Date()).toISOString().slice(0, 10)}
            label="Date"
            action={this.standardFormAction}
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.date.touched}
          />
          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            field="vendor"
            action={this.standardFormAction}
            label="Merchant"
            disabled={inProgress}
            readonly={readonly}
            required
            hideError={!form.vendor.touched}
          />
          {
            !this.state.forUpdate &&
            <IonItem lines="none" className="ion-no-padding ion-margin-top">
              <IonLabel>Reimbursable</IonLabel>
              <IonCheckbox
                slot="start"
                checked={form.reimbursable.value}
                onIonChange={e => this.standardFormAction('change', 'reimbursable', e.detail.checked)}
              />
            </IonItem>
          }

          <Components.ionic.forms.components.select
            form={form}
            field="reportId"
            options={reportOptions}
            action={this.standardFormAction}
            label="Report"
            placeholder={reportsAvailable ? '(automatic)' : 'No Reports Available'}
            disabled={inProgress || !reportsAvailable}
            readonly={readonly}
            hideError={!form.reportId.touched}
          />

          <Components.ionic.forms.components.select
            form={form}
            field="tripNumber"
            options={tripOptions}
            action={this.standardFormAction}
            label="Trip"
            placeholder={tripsAvailable ? '(unassigned)' : 'No Trips Available'}
            disabled={inProgress || !tripsAvailable}
            readonly={readonly}
            hideError={!form.tripNumber.touched}
          />

          <IonListHeader className="ion-no-padding">OPTIONAL</IonListHeader>

          <Components.ionic.forms.components.select
            form={form}
            field="category"
            action={this.standardFormAction}
            label="Category"
            options={categoryOptions}
            disabled={inProgress}
            readonly={readonly}
            hideError={!form.category.touched}
          />
          <Components.ionic.forms.components.textinput
            form={form}
            type="text"
            field="memo"
            action={this.standardFormAction}
            label="Memo"
            disabled={inProgress}
            readonly={readonly}
            hideError={!form.memo.touched}
          />
        </IonList>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_forms_expense);

// Internal Helper Functions ...
const _formatCategoryOptions = (categories) => {
  const toReturn = [];
  Object.keys(categories).forEach((categoryKey) => {
    const separatedCategories = categories[categoryKey].split(' / ');
    separatedCategories.forEach((category) => {
      toReturn.push({ value: categoryKey, label: category });
    });
  });
  return toReturn;
};
// GENERATOR_TYPE='component';
