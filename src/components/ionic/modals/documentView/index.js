import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonContent, IonHeader, IonButtons, IonButton, IonIcon, IonToolbar, IonTitle, IonPage, IonGrid, IonRow, IonCol, IonFooter, IonLabel } from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';
import { Filesystem, Directory } from '@capacitor/filesystem';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  pdfs: state.wfs.pdfs.data,
});

const mapDispatchToProps = (dispatch, props) => ({
  closeModal: () => {
    dispatch(Store.router.closeModal());
  },
  updateDeviceEvent: (eventType) => {
    dispatch(Store.device.updateData({ lastUserEventType: eventType }));
  },
});

const mapResourcesToProps = (state, props) => ({});

class components_ionic_modals_documentView extends Component {

  state = {
    expanded: false,
    nativePDF: false,
    wroteFile: false,
  };

  componentDidMount() {}

  componentWillUnmount() {
    this.close();
    this.props.closeModal();
  }

  close = async () => {
    if (this.state.wroteFile) {
      try {
        await Filesystem.deleteFile({
          path: this.props.data.document.documentName,
          directory: Directory.Cache,
        });
      } catch (e) {
        console.warn('Error deleting file', e);
      }

      this.props.updateDeviceEvent(null);
    }
  };

  didOpen = () => {
    this.setState({ wroteFile: true });
    this.props.updateDeviceEvent('openPDF');
  };

  render() {
    return (
      <IonPage className="components_ionic_modals_documentView">
        <IonHeader>
          <IonToolbar>
            <IonTitle className="ion-padding">
              {this.props.data.title}
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid className="ion-padding">
            {formats[this.props.data.type].fieldRows.map((field) => ( 
              <IonRow>
                <IonCol>
                  <IonRow>
                    <IonCol className="document-descriptors">
                      {field.title}
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol className={`document-values ${field.title === 'Status' ? this.props.data.statusClass : ''}`}>
                      {field.key.split('.').length === 1 ? field.formatter(this.props.data.document[field.key]) || 'N/A' : field.formatter(this.props.data.document[field.key.split('.')[0]][field.key.split('.')[1]]) || 'N/A'}
                    </IonCol>
                  </IonRow>
                </IonCol>
              </IonRow>
            ))}
            {formats[this.props.data.type].button &&
            <IonRow>
              <IonCol>
                <IonRow>
                  <IonCol className="document-descriptors">
                    View Document
                  </IonCol>
                </IonRow>
                <IonRow>
                  {this.state.nativePDF &&
                    <IonCol>
                      <Components.ionic.nativePDF id={this.props.data.document.resourceId} name={this.props.data.document.documentName} setWritten={this.didOpen} close={this.close} />
                    </IonCol>
                  }
                  {!this.state.nativePDF &&
                    <IonCol>
                      <IonButton style={{ width: '100%' }} onClick={() => this.setState({ nativePDF: true })}>
                        <IonIcon size="large" icon={documentTextOutline} color="light" />
                      </IonButton>
                    </IonCol>
                  }
                </IonRow>
              </IonCol>
            </IonRow>
          }
          </IonGrid>
        </IonContent>
        <IonFooter>
          <IonToolbar className="close-toolbar">
            <IonButtons>
              <IonButton className="close-button" onClick={() => this.props.closeModal()}>
                <IonLabel color="light">Close</IonLabel>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_documentView);

// Internal Helper Functions ... 
const formats = {
  salesOrders: {
    footer: false,
    fieldRows: [
      { title: 'Uplift Date:', key: 'upliftDate', formatter: value => value },
      { title: 'Status:', key: 'orderStatus', formatter: value => value },
      { title: 'Destination ICAO:', key: 'destinationIcao', formatter: value => value }, 
      { title: 'Domestic/International:', key: 'domesticIntl', formatter: value => value },
      { title: 'Product Description:', key: 'productDescription', formatter: value => value },
      { title: 'Unit of Measure:', key: 'uom', formatter: value => value },
      { title: 'Quantity:', key: 'quantity', formatter: value => value },
    ],
  },
  openFuelAuthorizations: {
    footer: true,
    fieldRows: [
      { title: 'Customer Name:', key: 'customerName', formatter: value => value },
      { title: 'Product Name:', key: 'productName', formatter: value => value },
      { title: 'Status:', key: 'status', formatter: value => value },
      { title: 'Contract Start Date:', key: 'contractStartDate', formatter: value => value.split(' ')[0] },
      { title: 'Contract End Date:', key: 'contractEndDate', formatter: value => value.split(' ')[0] },
      { title: 'Domestic/International:', key: 'domIntl', formatter: value => value },
      { title: 'FBO - ICAO:', key: 'fboIcao', formatter: value => value },
      { title: 'Flight Type:', key: 'flightType', formatter: value => value },
      { title: 'Flight Number:', key: 'flightNumber', formatter: value => value },
      { title: 'Special Instructions:', key: 'specialInstructions', formatter: value => value },
    ],
  },
  REC: {
    footer: false,
    fieldRows: [
      { title: 'FBO:', key: 'documentDetails.fboName', formatter: value => value },
      { title: 'ICAO:', key: 'documentDetails.icao', formatter: value => value },
      { title: 'Payment Type:', key: 'documentDetails.paymentType', formatter: value => value },
    ],
    button: true,
  },
  INV: {
    footer: false,
    fieldRows: [
      { title: 'FBO:', key: 'documentDetails.fboName', formatter: value => value },
      { title: 'ICAO:', key: 'documentDetails.icao', formatter: value => value },
      { title: 'Payment Type:', key: 'documentDetails.paymentType', formatter: value => value },
    ],
    button: true,
  },
  DOC: {
    footer: false,
    fieldRows: [
      { title: 'FBO:', key: 'documentDetails.fboName', formatter: value => value },
      { title: 'ICAO:', key: 'documentDetails.icao', formatter: value => value },
      { title: 'Payment Type:', key: 'documentDetails.paymentType', formatter: value => value },
    ],
    button: true,
  },
};

