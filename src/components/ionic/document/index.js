import { connect, Component } from 'component';
import { IonItem, IonGrid, IonRow, IonCol } from '@ionic/react';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => ({});

const mapDispatchToProps = (dispatch, props) => ({
  openModal: (data) => {
    dispatch(Store.router.openModal('Components.ionic.modals.documentView', data));
  },
});

const mapResourcesToProps = (state, props) => ({});

class components_ionic_document extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    let title;
    let documentTitle;
    let documentTitleShortened;
    let id;
    let info;
    let status;
    let statusClass;
    let paymentTypeString;
    let circle;
    // TODO : Shown data will change on list item
    // TODO : Clean up this code when we have the desired data set in stone (Irfan)
    switch (this.props.type) {
      case 'salesOrders':
        title = 'SO #';
        documentTitle = `${title} ${this.props.document.orderNumber}`;
        id = this.props.document.orderNumber;
        info = `${this.props.document.upliftDate.split('T')[0]}`;
        status = this.props.document.orderStatus;
        statusClass = (this.props.document.orderStatus === 'ENTERED' || this.props.document.orderStatus === 'BOOKED' || this.props.document.orderStatus === 'CLOSED') ? 'ACTIVE' : 'INACTIVE';
        break;
      case 'openFuelAuthorizations':
        title = 'Ref #';
        documentTitle = `${title} ${this.props.document.referenceNumber}`;
        id = this.props.document.referenceNumber;
        info = `${this.props.document.fboName.length > 23 ? `${this.props.document.fboName.slice(0, 23)}...` : this.props.document.fboName}`;
        status = this.props.document.status;
        statusClass = this.props.document.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
        break;
      case 'REC':
        circle = true;
        documentTitleShortened = `${this.props.document.documentDetails.fboName.length > 26 ? `${this.props.document.documentDetails.fboName.slice(0, 26)}...` : this.props.document.documentDetails.fboName}`;
        documentTitle = this.props.document.documentDetails.fboName;
        paymentTypeString = this.props.document.documentDetails.paymentType === 'UNDEFINED' ? '' : `${this.props.document.documentDetails.paymentType} - `;
        info = `${paymentTypeString}${this.props.document.documentDetails.date}`;
        id = this.props.document.documentId;
        break;
      case 'INV':
        circle = true;
        documentTitleShortened = `${this.props.document.documentDetails.fboName.length > 26 ? `${this.props.document.documentDetails.fboName.slice(0, 26)}...` : this.props.document.documentDetails.fboName}`;
        documentTitle = this.props.document.documentDetails.fboName;
        paymentTypeString = this.props.document.documentDetails.paymentType === 'UNDEFINED' ? '' : `${this.props.document.documentDetails.paymentType} - `;
        info = `${paymentTypeString}${this.props.document.documentDetails.date}`;
        id = this.props.document.documentId;
        break;
      case 'DOC':
      case 'serviceProviderDocuments':
      default:
        circle = true;
        documentTitleShortened = `${this.props.document.documentDetails.fboName.length > 26 ? `${this.props.document.documentDetails.fboName.slice(0, 26)}...` : this.props.document.documentDetails.fboName}`;
        documentTitle = this.props.document.documentDetails.fboName;
        paymentTypeString = this.props.document.documentDetails.paymentType === 'UNDEFINED' ? '' : `${this.props.document.documentDetails.paymentType} - `;
        info = `${paymentTypeString}${this.props.document.documentDetails.date}`;
        id = this.props.document.documentId;
        break;
    }

    return (
      <IonItem className="components_ionic_document transaction-item" lines={this.props.lastItem ? 'none' : 'full'} onClick={() => this.props.openModal({ document: this.props.document, type: this.props.type, id, statusClass, title: documentTitle })}>
        <IonGrid className="ion-padding-end">
          <IonRow className="ion-justify-content-between transaction-item-row-1 centerRow">
            {circle &&
              <IonCol size="2" className="ion-text-uppercase circle-container" >
                <div className="circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '54px', height: '54px' }}>
                  <span>{this.props.type}</span>
                </div>
              </IonCol>
            }
            <IonCol size={status ? '9' : '10'} className="ion-text-left">
              <IonRow>
                <IonCol className="document-title">{documentTitleShortened || documentTitle}</IonCol>
              </IonRow>
              <IonRow>
                <IonCol className="document-detail">{info}</IonCol>
              </IonRow>
            </IonCol>
            {status ?
              <IonCol className={`ion-text-left ${statusClass}`} size="3" style={{ fontSize: '14px' }}>{status}</IonCol>
              :
              null
            }
          </IonRow>
        </IonGrid>
      </IonItem>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_document);


