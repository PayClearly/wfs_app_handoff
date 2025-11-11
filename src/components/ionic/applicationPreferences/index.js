import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonCard, IonCardHeader, IonCardContent, IonLabel, IonToggle, IonItem, IonList, CreateAnimation } from '@ionic/react';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    applicationPreferences: state.wfs.preferences,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    errorTracingSet: (errorTracing) => {
      dispatch(Store.wfs.setErrorTracing(errorTracing));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_applicationPreferences extends Component {
  state = {}





  onToggle = (e) => {
    // we want to manage the state ourselves because the ionic event triggers twice sometimes (known bug)
    // so we just use react onClick and manage everything on our own
    const toggleVal = !this.props.applicationPreferences.data[e.currentTarget.name];
    this.props[`${e.currentTarget.name}Set`](toggleVal);
  }

  render() {
    const errorTracingValue = this.props.applicationPreferences.data.errorTracing;

    return (
      <IonCard className="components_ionic_applicationPreferences">
        <IonCardHeader style={{ padding: '10px 20px 5px' }}>
          <IonItem lines="none" className="title ion-no-padding no-inner-padding">
            <IonLabel>Application Preferences</IonLabel>
          </IonItem>
        </IonCardHeader>
        <IonCardContent>
          <IonList className="margin-vertical" lines="none">
            <IonItem className="ion-no-padding">
              <IonLabel>Error Tracing</IonLabel>
              <IonToggle name="errorTracing" checked={errorTracingValue} onClick={this.onToggle} />
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_applicationPreferences);


