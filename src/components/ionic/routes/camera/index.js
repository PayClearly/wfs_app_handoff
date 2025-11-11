import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonContent, IonGrid, IonFab, IonFabButton, IonIcon, IonRow, IonCol, IonImg } from '@ionic/react';
import { camera } from 'ionicons/icons/index.js';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    photo: state.device.data.base64String,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    takePhoto: () => {
      dispatch(Store.device.takePhoto());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_routes_camera extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <div className="components_ionic_routes_camera" style={{ height: '100%' }}>
        <IonContent>
          {
            this.props.photo &&
            <IonGrid>
              <IonRow>
                <IonCol size="6">
                  <IonImg src={`data:image/jpeg;base64,${this.props.photo}`} />
                </IonCol>
              </IonRow>
            </IonGrid>
          }
          <IonFab vertical="center" horizontal="center" slot="fixed">
            <IonFabButton>
              <IonIcon icon={camera} onClick={() => { this.props.takePhoto(); }} />
            </IonFabButton>
          </IonFab>
        </IonContent>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_routes_camera);


