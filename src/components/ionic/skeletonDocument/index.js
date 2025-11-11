import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonItem, IonGrid, IonRow, IonCol, IonSkeletonText } from '@ionic/react';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_skeletonDocument extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    if (this.props.type === 'serviceProviderDocuments') {
      return (
        <IonItem className="components_ionic_skeletonDocument transaction-item" lines={this.props.lastItem ? 'none' : 'full'}>
          <IonGrid>
            <IonRow className="ion-justify-content-between transaction-item-row-1 centerRow">
              <IonCol size="2" className="ion-text-uppercase circle-container" >
                <div style={{ height: '54px', width: '54px', display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                  <IonSkeletonText animated style={{ borderRadius: '50%' }} />
                </div>
              </IonCol>
              <IonCol size="10" className="ion-text-left">
                <IonRow>
                  <IonSkeletonText animated style={{ height: '29px' }} />
                </IonRow>
                <IonRow>
                  <IonSkeletonText animated style={{ height: '14px' }} />
                </IonRow>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonItem>
      );
    }
    return (
      <IonItem className="components_ionic_skeletonDocument transaction-item" lines={this.props.lastItem ? 'none' : 'full'}>
        <IonGrid>
          <IonRow className="ion-justify-content-between transaction-item-row-1 centerRow">
            <IonCol size="9" className="ion-text-left">
              <IonRow>
                <IonSkeletonText animated style={{ height: '29px' }} />
              </IonRow>
              <IonRow>
                <IonSkeletonText animated style={{ height: '14px' }} />
              </IonRow>
            </IonCol>
            <IonCol size="3">
              <IonSkeletonText animated style={{ height: '18px' }} />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonItem>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_skeletonDocument);


