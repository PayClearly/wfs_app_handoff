import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonIcon, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonList } from '@ionic/react';
import { checkmark } from 'ionicons/icons'

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    // biometricsTimeout: _try(() => state.wfs.preferences.data.biometricsTimeout),
    deviceSecurity: Selectors.deviceSecurity(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
    biometricsTimeoutSet: (biometricsTimeout) => {
      dispatch(Store.wfs.setBiometricsTimeout(biometricsTimeout));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_modals_bioTimeoutSelect extends Component {

  state = {};

  componentDidMount() { }
  componentDidUpdate() { }
  componentWillUnmount() { }

  onChoose = (e) => {
    this.props.biometricsTimeoutSet(e.currentTarget.value);
    this.props.closeModal();
  }

  render() {
    return (
      <div className="components_ionic_modals_bioTimeoutSelect">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Authentication</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={this.props.closeModal}>Cancel</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            {this.props.deviceSecurity.options.map(({ label, value, selected }) => (
              <IonItem value={value} onClick={this.onChoose}>
                <IonLabel>
                  {label}
                </IonLabel>
                {selected ?
                  <IonIcon icon={checkmark} />
                  : null}
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_bioTimeoutSelect);


