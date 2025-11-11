import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonPage, IonContent, IonHeader, IonText, IonButtons, IonButton, IonIcon, IonToolbar, IonTitle, IonSearchbar, IonList, IonFooter } from '@ionic/react';
import { add, close } from 'ionicons/icons';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    expenses: Selectors.expenses(state).expenses,
    form: state.forms['Components.ionic.forms.report'].default,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
    openCreateExpenseModal: () => {
      dispatch(Store.router.openModal('Components.ionic.modals.expense'));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_modals_reportExpense extends Component {

  state = {
    searchText: '',
  }

  componentDidMount() {}
  componentWillUnmount() {}

  toggleExpense = (expense) => {
    this.props.data.action('change', 'expenseIds', expense);
  }

  render() {
    const { expenses = {} } = this.props;
    const filteredUnassignedExpenses = Object.values(expenses).filter(expense => (!expense.deleted && !expense.reportId && expense.vendor.toLowerCase().includes(this.state.searchText.toLowerCase())));
    const expenseIds = Object.keys(_resolve(this.props, 'form.expenseIds.value', {}));
    return (
      <IonPage className="components_ionic_modals_reportExpense">
        <IonHeader>
          <IonToolbar>
            <IonSearchbar
              value={this.state.searchText}
              onIonChange={e => this.setState({ searchText: e.detail.value })}
              inputMode="text"
              placeholder="Search Merchants..."
            />
            <IonButtons slot="end" >
              <IonButton onClick={this.props.closeModal}>
                <IonIcon size="large" icon={close} color="light" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          
          <IonList className="ion-margin-bottom" lines="full">
            {
              filteredUnassignedExpenses.map(expense => (
                <Components.ionic.expense
                  data={expense}
                  selected={!!_resolve(this.props, `form.expenseIds.value.${expense._id}`)}
                  onClick={() => this.toggleExpense(expense)}
                />
              ))
            }
          </IonList>

          <div className="ion-margin">
            <IonButton onClick={this.props.openCreateExpenseModal} className="new-expense-button" strong fill="outline" expand="block" color="light">
              <IonIcon slot="start" icon={add} />
              <IonText>NEW EXPENSE</IonText>
            </IonButton>
          </div>
        </IonContent>
        <IonFooter>
          <IonToolbar className="ion-padding-horizontal ion-padding-bottom">
            <IonButton
              className="ion-text-uppercase"
              expand="block"
              fill="outline"
              color="primary"
              onClick={this.props.closeModal}
              disabled={expenseIds.length === 0}
            >
              <IonText color="light">SELECT</IonText>
            </IonButton>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_reportExpense);

// Internal Helper Functions ... 
const _sortAlphabetically = (categories) => {
  return categories.sort((a, b) => a.label.localeCompare(b.label));
};

