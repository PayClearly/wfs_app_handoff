import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonItem, IonGrid, IonRow, IonCol, IonButton, IonIcon } from '@ionic/react';
import { trashOutline } from 'ionicons/icons';

import Utils from 'utils';
import Store from 'store';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openExpenseModal: (data) => {
      dispatch(Store.router.openModal('Components.ionic.modals.expense', data));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_expense extends Component {




  handleClick = () => {
    if (this.props.onClick && typeof this.props.onClick === 'function') this.props.onClick();
    else this.props.openExpenseModal(this.props.data);
  }

  render() {
    if (!this.props.data) return null;
    const { vendor, amount, category, date } = this.props.data;
    const categories = {
      1: 'Maintenance',
      2: 'Fuel',
      3: 'Terminal Fuel',
      A: 'Automobile / Vehicle Rental',
      C: 'Cash Disbursements',
      F: 'Restaurant (Food)',
      H: 'Hotel / Motel / Cruise-Ship',
      O: 'College / School Expense / Hospital',
      R: 'Card Activated Terminals / Retail Sales',
      T: 'Pre-Authorized Transactions / Mail / Telephone / E-Commerce',
      U: 'Unique Transactions / Card Activated Terminals at Truck Stop',
      X: 'Passenger Transportation',
    };

    return (
      <IonItem className="components_ionic_expense transaction-item" lines={this.props.lastItem ? 'none' : 'full'} disabled={this.props.disabled} color={this.props.selected && 'primary'} onClick={this.handleClick}>
        <IonGrid className="ion-padding-vertical ion-padding-end">
          <IonRow className="ion-justify-content-between transaction-item-row-1">
            <IonCol size="8" className="ion-text-uppercase">{vendor}</IonCol>
            <IonCol className="ion-text-right">${parseFloat(amount).toFixed(2)}</IonCol>
          </IonRow>
          <IonRow className="ion-padding-bottom ion-justify-content-between transaction-item-row-2">
            <IonCol className="ion-text-capitalize">{category ? categories[category] : '(Type not selected)'}</IonCol>
            <IonCol className="ion-text-right">{Utils.dates.dateToDay(date, 'mm-dd-yyyy')}</IonCol>
          </IonRow>
        </IonGrid>
        {
          this.props.onRemove && !this.props.forView &&
          <IonButton className="delete-button" fill="outline" slot="end" onClick={(e) => { e.stopPropagation(); this.props.onRemove(this.props.data); }}>
            <IonIcon className="delete-icon" slot="icon-only" icon={trashOutline} />
          </IonButton>
        }
      </IonItem>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_expense);


