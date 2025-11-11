import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { airplane, receipt, camera, documents } from 'ionicons/icons';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openExpenseModal: () => {
      dispatch(Store.router.openModal('Components.ionic.modals.expense'));
    },
    openReportModal: () => {
      dispatch(Store.router.openModal('Components.ionic.modals.report'));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_modals_createNew extends Component {

  state = {
    options: {
      expense: {
        icon: receipt,
        label: 'Expense',
        handler: 'openExpenseModal',
      },
      report: {
        icon: documents,
        label: 'Report',
        handler: 'openReportModal',
      },
      trip: {
        icon: airplane,
        label: 'Trip',
      },
      receipt: {
        icon: camera,
        label: 'Receipt',
      },
    },
  }




  navigate = (key) => {
    this.props.closeCreateMenu();
    switch (key) {
      case 'expense':
        this.props.openExpenseModal();
        break;
      case 'report':
        this.props.openReportModal();
        break;
      default:
        break;
    }
  }
  createButton = (key) => {
    const { icon, label } = this.state.options[key];
    return (
      <div role="navigation" onClick={() => this.navigate(key)}>
        <IonIcon className="create-icon" icon={icon} />
        <IonText color="light">{label}</IonText>
      </div>
    );
  }

  render() {
    return (
      <div className="components_ionic_modals_createNew ion-text-center ion-padding">
        <IonText color="light" className="ion-text-center">Add new...</IonText>
        <div className="space-between ion-padding-vertical">
          {
            Object.keys(this.state.options).map(option => this.createButton(option))
          }
        </div>
        <IonButton fill="outline" expand="block" onClick={this.props.closeCreateMenu} >CLOSE</IonButton>
      </div>

    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_createNew);


