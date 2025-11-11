import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonItem, IonGrid, IonRow, IonCol, IonChip, IonIcon, IonSpinner, IonButton } from '@ionic/react';
import { downloadOutline } from 'ionicons/icons';

import Store from 'store';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openReportModal: () => {
      dispatch(Store.router.openModal('Components.ionic.modals.report', { id: props.data._id }));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_report extends Component {




  render() {
    const { lastItem, data, exporting } = this.props;
    const { name, recordTotal, expenseIds = {}, status } = data;
    const numberOfExpenses = Object.keys(expenseIds).length;
    return (
      <IonItem className="components_ionic_report" lines={lastItem ? 'none' : 'full'} onClick={this.props.openReportModal}>
        <div className="ion-padding-vertical" slot="start" style={{ width: '50%' }}>
          <div className="report-name">{name.length <= 26 ? name : `${name.substring(0, 22)}...`}</div>
          <div className="report-amount"><strong>${parseFloat(recordTotal).toFixed(2)}</strong></div>
          <div className="report-expenses">{`${numberOfExpenses} Expense${numberOfExpenses > 1 ? 's' : ''}`}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '25%' }}>
            <IonButton className="export-button" fill="outline" onClick={this.props.download}>
              {
                exporting ? <IonSpinner name="crescent" /> : <IonIcon icon={downloadOutline} />
              }
            </IonButton>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '75%' }}>
            <IonChip className="ion-text-uppercase" color="light" outline>{status}</IonChip>
          </div>
        </div>
      </IonItem>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_report);


