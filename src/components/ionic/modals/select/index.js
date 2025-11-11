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
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_modals_select extends Component {

  state = {
    searchText: '',
    options: [],
  }

  componentDidMount() {
    this.setState({ options: this.props.data.options });
  }
  componentWillUnmount() {}

  handleSelect = (value) => {
    this.props.data.action('change', this.props.data.field, value);
    this.props.closeModal();
  }

  render() {
    const optionItem = ({ label, value }) => {
      return (
        <IonItem button detail={false} onClick={() => this.handleSelect(value)} >
          <IonLabel>{label}</IonLabel>
        </IonItem>
      );
    };
    const filteredOptions = this.state.options.filter(option => option.label.toLowerCase().includes(this.state.searchText.toLowerCase()));
    
    return (
      <IonPage className="components_ionic_modals_select">
        <IonHeader>
          <IonToolbar>
            <IonSearchbar
              value={this.state.searchText}
              onIonChange={e => this.setState({ searchText: e.detail.value })}
              inputMode="text"
              placeholder="Search..."
            />
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
              filteredOptions.map(category => optionItem(category))
            }
          </IonList>
        </IonContent>
      </IonPage>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_select);

// Internal Helper Functions ... 
const _sortAlphabetically = (categories) => {
  return categories.sort((a, b) => a.label.localeCompare(b.label));
};

