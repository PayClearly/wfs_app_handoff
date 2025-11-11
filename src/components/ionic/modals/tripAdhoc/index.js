import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonPage, IonContent, IonHeader, IonFooter, IonButtons, IonButton, IonIcon, IonToolbar, IonTitle, IonSpinner, IonText } from '@ionic/react';
import { close } from 'ionicons/icons';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    adhocTripsStatus: state.wfs.adhocTrips.status,
    forms: state.forms,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
    createTrip: (data) => {
      dispatch(Store.wfs.createAdhocTrip(data));
    },
    updateTrip: (id, data) => {
      dispatch(Store.wfs.updateAdhocTrip(id, data));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_modals_tripAdhoc extends Component {

  state = {
    forUpdate: false,
  }

  componentDidMount() {
    this.setState({ forUpdate: !!Object.keys(_resolve(this.props, 'data', {})).length });
  }

  componentDidUpdate(prevProps) {
    // successfully created
    if (prevProps.adhocTripsStatus.creating && !this.props.adhocTripsStatus.creating && this.props.adhocTripsStatus.created && !this.props.adhocTripsStatus.creatingError) {
      this.close();
    }
    // successfully updated
    if (prevProps.adhocTripsStatus.updating && !this.props.adhocTripsStatus.updating && this.props.adhocTripsStatus.updated && !this.props.adhocTripsStatus.updatingError) {
      this.close();
    }
  }



  handleClick = async () => {
    const data = Object.assign({}, this.props.forms['Components.ionic.forms.tripAdhoc'].default._values);

    if (!this.state.forUpdate) this.props.createTrip(data);
    else this.props.updateTrip(this.props.data._id, data);
  };

  handleDelete = () => {
    this.props.updateTrip(this.props.data._id, { deleted: true });
  };

  close = () => {
    if (this.props.modal.current) this.props.modal.current.dismiss();
    else this.props.closeModal();
  };

  render() {
    const buttonText = this.state.forUpdate ? 'UPDATE' : 'CREATE';

    const inProgress = this.props.adhocTripsStatus.updating || this.props.adhocTripsStatus.creating;
    const allInitial = _try(() => this.props.forms['Components.ionic.forms.tripAdhoc'].default._allInitial);
    const allValid = _try(() => this.props.forms['Components.ionic.forms.tripAdhoc'].default._allValid);

    const title = this.state.forUpdate ? 'EDIT TRIP' : 'NEW TRIP';
    const readonly = false;

    return (
      <IonPage className="components_ionic_modals_tripAdhoc">
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
          <Components.ionic.forms.tripAdhoc initialFormData={this.props.data} readonly={readonly} />
        </IonContent>
        <IonFooter>
          <IonToolbar className="ion-padding-horizontal ion-padding-bottom">
            {this.state.forUpdate && this.props.data.source !== 'automatic'
              && (
                <IonButton
                  className="ion-text-uppercase delete-button"
                  expand="block"
                  fill="outline"
                  onClick={this.handleDelete}
                  disabled={this.props.adhocTripsStatus.updating}
                >
                  {inProgress ? <IonSpinner name="crescent" /> : <IonText color="light">Delete</IonText>}
                </IonButton>
              )}
            <IonButton
              className="ion-text-uppercase create-button"
              expand="block"
              fill="outline"
              onClick={this.handleClick}
              disabled={this.props.adhocTripsStatus.updating || allInitial || !allValid}
            >
              {inProgress ? <IonSpinner name="crescent" /> : <IonText color="light">{buttonText}</IonText>}
            </IonButton>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_tripAdhoc);


