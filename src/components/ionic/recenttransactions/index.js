import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonButton, IonGrid, IonRow, IonCol, IonText } from '@ionic/react';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    transactions: Selectors.expenses(state).recentExpenses,
    wfsStatus: state.wfs.status,
    context: state.wfs.data.context,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    navigate: (name, params = {}) => {
      dispatch(Store.router.navigateTo(name, params));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_recenttransactions extends Component {




  render() {
    const transactionItems = Object.values(this.props.transactions).map((transaction, index, arr) => (
      <Components.ionic.expense data={transaction} lastItem={index === arr.length - 1} key={transaction.vendor} />
    ));

    return (
      <IonCard className="components_ionic_recenttransactions ion-margin">
        <IonCardHeader>
          <IonCardTitle>Recent Transactions</IonCardTitle>
        </IonCardHeader>

        {!this.props.context.tailNumber && this.props.wfsStatus.initialized ?
          <IonCardContent>
            <p style={{ marginBottom: '16px' }}>Transactions are Unavailable without selecting a tail</p>
          </IonCardContent>
          :
          <IonCardContent>
            <p>Displaying transactions from the past 7 days...</p>
            <IonList lines="full">
              {transactionItems}
            </IonList>
            <IonButton
              expand="block"
              fill="outline"
              className="ion-padding ion-text-uppercase ion-margin-top"
              onClick={() => this.props.navigate('expenses')}
            >
              Show Older Transactions
            </IonButton>
          </IonCardContent>
        }
      </IonCard>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_recenttransactions);


