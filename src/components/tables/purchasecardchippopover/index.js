import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';
import { PopoverHeader, PopoverBody } from 'reactstrap';


import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    purchaseCards: state.account.paymentCards.data.items,
    virtualCards: state.account.virtualCards.data.items,
    virtualCardsDenorm: state.account.virtualCardsDenorm.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    goToPaymentCardTable: (routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo('history', routeParams, routeOptions));
    },
  });
};

class components_tables_purchasecardchippopover extends Component {

  componentDidMount() {

  }


  navigateToDetails = () => {
    const { refId, purchaseCards } = this.props;
    const purchaseCard = purchaseCards[refId];
    this.props.goToPaymentCardTable({ card: purchaseCard.id, tab: 'paymentCards' });
  }

  render() {
    const { refId, purchaseCards, virtualCards, virtualCardsDenorm } = this.props;
    const purchaseCard = purchaseCards[refId];
    const virtualCard = virtualCards[purchaseCard.vCard];
    const transactionInformation = virtualCardsDenorm[purchaseCard.vCard] || {};
    const data = {
      ...purchaseCard,
      ...purchaseCard.customFields,
      amount: virtualCard.amount,
      balance: transactionInformation.remaining,
      dateCreated: purchaseCard._createdAt,
      formattedBalance: transactionInformation.remaining,
      formattedLimit: virtualCard.amount,
      id: purchaseCard.id,
      issueDate: virtualCard.createdAt,
      lastFour: virtualCard.cardNumberLastFour,
      purchaseCardRef: purchaseCard._ref,
      status: transactionInformation.status,
      transactionInformation,
    };

    return (
      <div className="components_tables_purchasecardchippopover">
        <PopoverHeader className="chip-popover-header">
          <span>
            <i className="mdi mdi-credit-card-outline me-1" />
            Card Details
          </span>
          <i role="tooltip" className="mdi mdi-link float-end" onClick={this.navigateToDetails} />
        </PopoverHeader>
        <PopoverBody>
          <table>
            <tr>
              <td className="md-1">Name:</td>
              <td className="md-2">{_try(() => data.name)}</td>
            </tr>
            <tr className="md-3">
              <td>Status:</td>
              <td><Components.badges.status data={data.status} /></td>
            </tr>
            <tr>
              <td>Created:</td>
              <td>{Utils.dates.dateToDay(data.dateCreated, 'dayOnly')}</td>
            </tr>
            <tr>
              <td>Limit:</td>
              <td>{numeral(data.amount).format('$0,0.00')}</td>
            </tr>
            <tr>
              <td>Remaining:</td>
              <td>{numeral(_try(() => data.balance)).format('$0,0.00')}</td>
            </tr>
            <tr>
              <td>Card #:</td>
              <td>*{_try(() => data.lastFour) || '***'}</td>
            </tr>
          </table>
        </PopoverBody>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_purchasecardchippopover);



// const data = {
//   ...purchaseCard,
//   ...purchaseCard.customFields,
//   amount: virtualCard.amount,
//   balance: transactionInformation.remaining,
//   dateCreated: purchaseCard._createdAt,
//   formattedBalance: transactionInformation.remaining,
//   formattedLimit: virtualCard.amount,
//   id: purchaseCard.id,
//   issueDate: virtualCard._createdAt,
//   lastFour: virtualCard.cardNumberLastFour,
//   purchaseCardRef: purchaseCard._ref,
//   status: transactionInformation.status,
//   transactionInformation,
// }
