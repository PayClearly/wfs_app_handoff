/* eslint-disable react/jsx-pascal-case */
import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonText, IonButton, IonIcon, IonList, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/react';
import { add } from 'ionicons/icons';

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
    user: _try(() => state.wfs.oAuth.data.decoded['https://wfscorp.com/custom-claims'], {}),
    expenses: Selectors.expenses(state).expenses,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
    openExpenseModal: (form, action) => {
      dispatch(Store.router.openModal('Components.ionic.modals.reportExpense', { form, action, animation: 'slideUp' }));
    },
    ...bindActionCreators(Store.forms, dispatch),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_forms_report extends Component {
  state = {
    name: 'Components.ionic.forms.report',
    forUpdate: false,
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const initialFormData = this.props.initialFormData || {};
    const formKey = this.props.formKey || 'default';
    initialize(this.state.name, formKey, {
      name: initialFormData.name || `${Utils.dates.dateToDay(Date.now(), 'mm-dd-yyyy')} ${this.props.user.name}`,
      submitted: initialFormData.submitted || false,
      expenseIds: initialFormData.expenseIds || {},
    });
    validate(this.state.name, formKey, this.validate);

    this.setState({ key: formKey, forUpdate: !!Object.keys(initialFormData).length });
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

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      if (field === 'expenseIds') {
        const id = value._id;
        const selectedExpenses = Object.assign({}, this.state.form.expenseIds.value);
        if (selectedExpenses[id]) {
          delete selectedExpenses[id];
        } else {
          selectedExpenses[id] = value;
        }
        this.props.change(this.state.name, this.state.key, field, selectedExpenses);
        this.props.validate(this.state.name, this.state.key, this.validate);
      } else {
        this.props[action](this.state.name, this.state.key, field, value);
        this.props.validate(this.state.name, this.state.key, this.validate);
      }
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const errors = {};

    if (!values.name) {
      errors.name = 'Amount is required';
    }
    // if (!(Object.keys(values.expenseIds || {}).length)) {
    //   errors.expenseIds = 'Expense is required';
    // }

    return errors;
  };

  handleRemove = (expense) => {
    this.standardFormAction('change', 'expenseIds', expense);
  }

  render() {
    const { form } = this.state;
    if (!form) return null;

    const inProgress = this.props.updating || this.props.creating;

    const expensesById = this.props.expenses.reduce((acc, expense) => {
      acc[expense._id] = expense;
      return acc;
    }, {});

    return (
      <form className="components_ionic_forms_report ion-margin" onSubmit={this.props.onSubmit}>
        <Components.ionic.forms.components.textinput
          className="ion-padding-bottom border-bottom"
          form={form}
          type="text"
          field="name"
          action={this.standardFormAction}
          label="Name"
          disabled={inProgress || this.props.forView}
          required
          hideError={!form.name.touched}
        />

        <IonList className="ion-margin-bottom">
          {
            Object.keys(form.expenseIds.value).map(id => (
              <Components.ionic.expense data={expensesById[id]} onRemove={this.handleRemove} forView={this.props.forView} />
            ))
          }
        </IonList>
        { !this.props.forView &&
          <IonButton onClick={() => this.props.openExpenseModal(form, this.standardFormAction)} className="add-receipt-button" strong fill="outline" expand="block" color="light">
            <IonIcon slot="start" icon={add} />
            <IonText>ADD EXPENSE</IonText>
          </IonButton>
        }
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_forms_report);

// Internal Helper Functions ...
const _snakeCaseToCapitalCase = (value) => {
  return value.replace(/[A-Z]/g, n => ` ${n}`);
}
// GENERATOR_TYPE='component';
