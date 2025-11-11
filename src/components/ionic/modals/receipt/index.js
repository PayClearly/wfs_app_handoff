import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonPage, IonContent, IonHeader, IonFooter, IonButtons, IonButton, IonIcon, IonToolbar, IonTitle, IonText, IonActionSheet, IonImg } from '@ionic/react';
import { close, camera } from 'ionicons/icons';
import firebase from 'firebase';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
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
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_modals_receipt extends Component {

  state = {
    forUpdate: false,
    token: null,
  }

  componentDidMount() {
    return firebase.auth().currentUser.getIdToken().then(token => this.setState({ token }));
  }


  close = () => {
    if (this.props.modal.current) this.props.modal.current.dismiss();
    else this.props.closeModal();
  }

  handleRemoveReceipt = () => {
    this.props.data.action('change', 'receipt', null);
    this.close();
  }

  render() {
    const receipt = _try(() => this.props.forms['Components.ionic.forms.expense'].default.receipt.value, '');
    return (
      <IonPage className="components_ionic_modals_receipt">
        <IonHeader>
          <IonToolbar>
            <IonTitle slot="start">RECEIPT</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={this.close}>
                <IonIcon size="large" icon={close} color="light" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-justify-content-center ion-align-items-center">
          <Components.ionic.image alt="Receipt" src={typeof receipt === 'string' && receipt} path={receipt && typeof receipt === 'object' && receipt.storagePath} /> :
        </IonContent>
        {!this.props.data.isSubmitted &&
          <IonFooter>
            <IonToolbar>
              <IonButtons className="ion-text-center space-around ion-padding-bottom">
                <div className="align-items-vertical" onClick={this.handleRemoveReceipt}>
                  <IonIcon className="remove-button" color="danger" icon={close} />
                  <IonText color="danger">Remove</IonText>
                </div>
                <div className="align-items-vertical" onClick={() => this.setState({ showReceiptActionSheet: true })}>
                  <IonIcon className="replace-button" color="light" icon={camera} />
                  <IonText color="light">Replace</IonText>
                </div>
              </IonButtons>
            </IonToolbar>
          </IonFooter>
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
          }, {
            text: 'Cancel',
            cssClass: 'light',
            role: 'cancel',
          }]}
        />
      </IonPage>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_receipt);


