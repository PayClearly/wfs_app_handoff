import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonPage, IonContent, IonHeader, IonFooter, IonButtons, IonButton, IonIcon, IonToolbar, IonTitle, IonSpinner, IonText } from '@ionic/react';
import { close } from 'ionicons/icons';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    expensesStatus: state.account.expenses.status,
    forms: state.forms,
    submittedExpenseReports: Selectors.expenses(state).submittedExpenseReports,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
    createExpense: (data) => {
      dispatch(Store.account.createExpense(data));
    },
    updateExpense: (id, data) => {
      dispatch(Store.account.updateExpense(id, data));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_modals_expense extends Component {

  state = {
    forUpdate: false,
  }

  componentDidMount() {
    this.setState({ forUpdate: !!Object.keys(_resolve(this.props, 'data', {})).length });
  }
  componentDidUpdate(prevProps) {
    // successfully created
    if (prevProps.expensesStatus.creating && !this.props.expensesStatus.creating && this.props.expensesStatus.created && !this.props.expensesStatus.creatingError) {
      this.close();
    }
    // successfully updated
    if (prevProps.expensesStatus.updating && !this.props.expensesStatus.updating && this.props.expensesStatus.updated && !this.props.expensesStatus.updatingError) {
      this.close();
    }
  }


  handleClick = async () => {
    const data = Object.assign({}, this.props.forms['Components.ionic.forms.expense'].default._values);
    // convert webPath to File
    if (data.receipt && typeof data.receipt === 'string') {
      const res = await fetch(data.receipt);
      const blob = await res.blob();
      const receiptFile = new File([blob], `${data.amount} ${data.vendor}`, { type: 'image/jpeg' });
      data.receipt = [receiptFile];
    }
    if (!this.state.forUpdate || this.props.data.fromTransaction) this.props.createExpense(data);
    else this.props.updateExpense(this.props.data._id, data);
  }

  handleDelete = () => {
    this.props.updateExpense(this.props.data._id, { deleted: true });
  }

  close = () => {
    if (this.props.modal.current) this.props.modal.current.dismiss();
    else this.props.closeModal();
  }

  render() {
    const buttonText = this.state.forUpdate ? 'UPDATE' : 'CREATE';

    const inProgress = this.props.expensesStatus.updating || this.props.expensesStatus.creating;
    const allInitial = _try(() => this.props.forms['Components.ionic.forms.expense'].default._allInitial);
    const allValid = _try(() => this.props.forms['Components.ionic.forms.expense'].default._allValid);
    const isInSubmittedReport = this.props.submittedExpenseReports.find(report => this.props.data.reportId === report._id);
    let title = '';
    let readonly = false;
    if (isInSubmittedReport) {
      title = 'VIEW EXPENSE';
      readonly = true;
    } else {
      title = this.state.forUpdate ? 'EDIT EXPENSE' : 'NEW EXPENSE';
    }

    return (
      <IonPage className="components_ionic_modals_expense">
        <IonHeader>
          <IonToolbar>
            <IonTitle slot="start">{title}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={this.close}>
                <IonIcon size="large" icon={close} color="light" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <Components.ionic.forms.expense initialFormData={this.props.data} readonly={readonly} />
        </IonContent>
        {!isInSubmittedReport &&
          <IonFooter>
            <IonToolbar className="ion-padding-horizontal ion-padding-bottom">
              {this.state.forUpdate && this.props.data.source !== 'automatic' &&
                <IonButton
                  className="ion-text-uppercase delete-button"
                  expand="block"
                  fill="outline"
                  onClick={this.handleDelete}
                  disabled={this.props.expensesStatus.updating}
                >
                  {inProgress ? <IonSpinner name="crescent" /> : <IonText color="light" >Delete</IonText>}
                </IonButton>
              }
              <IonButton
                className="ion-text-uppercase create-button"
                expand="block"
                fill="outline"
                onClick={this.handleClick}
                disabled={this.props.expensesStatus.updating || allInitial || !allValid}
              >
                {inProgress ? <IonSpinner name="crescent" /> : <IonText color="light" >{buttonText}</IonText>}
              </IonButton>
            </IonToolbar>
          </IonFooter>
        }
      </IonPage>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_expense);


