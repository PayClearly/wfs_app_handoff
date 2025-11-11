import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonPage, IonContent, IonHeader, IonFooter, IonButtons, IonButton, IonIcon, IonToolbar, IonTitle, IonSearchbar, IonList, IonItem, IonLabel } from '@ionic/react';
import { close } from 'ionicons/icons';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
    createExpense: (data) => {
      dispatch(Store.account.createExpense(data));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_modals_expenseCategory extends Component {

  state = {
    searchText: '',
    categories: [],
  }

  componentDidMount() {

    this.setState({ categories: this.props.data.options });
  }
  componentWillUnmount() {}

  setCategory = (value) => {
    this.props.data.action('change', 'category', value);
    this.props.closeModal();
  }

  render() {
    const forUpdate = !!Object.keys(_resolve(this.props, 'data', {})).length;
    const categoryItem = ({ label, value }) => {
      return (
        <IonItem button detail={false} onClick={() => this.setCategory(value)} >
          <IonLabel>{label}</IonLabel>
        </IonItem>
      );
    };
    const filteredCategoryOptions = this.state.categories.filter(category => category.label.toLowerCase().includes(this.state.searchText.toLowerCase()));
    return (
      <IonPage className="components_ionic_modals_expenseCategory">
        <IonHeader>
          <IonToolbar>
            {/* <IonTitle> */}
            <IonSearchbar
              value={this.state.searchText}
              onIonChange={e => this.setState({ searchText: e.detail.value })}
              inputMode="text"
              placeholder="Search..."
            />
            {/* </IonTitle> */}
            <IonButtons slot="end" >
              <IonButton onClick={this.props.closeModal}>
                <IonIcon size="large" icon={close} color="light" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          
          <IonList lines="full">
            {
              filteredCategoryOptions.map(category => categoryItem(category))
            }
          </IonList>
        </IonContent>
      </IonPage>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_expenseCategory);

// Internal Helper Functions ... 
const _sortAlphabetically = (categories) => {
  return categories.sort((a, b) => a.label.localeCompare(b.label));
};

