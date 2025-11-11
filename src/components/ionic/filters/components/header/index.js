import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonHeader, IonToolbar, IonTitle } from '@ionic/react';

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

class components_ionic_filters_components_header extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <IonHeader className="components_ionic_filters_components_header ion-no-border">
        <IonToolbar className="filterHeaderToolbar darkBar">
          <IonTitle className="filterHeaderTitle">{this.props.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_filters_components_header);


