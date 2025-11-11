import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';
import { PopoverHeader, PopoverBody } from 'reactstrap';


import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    paymentCards: state.account.paymentCards.data.items,
    vCards: _try(() => state.account.cardsIntegration.data.resources.vCards),
    modals: state.router.modals,
    paymentCardsVCardMetadata: _try(() => Selectors.paymentCards(state).paymentCardsVCardMetadata, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    goToPaymentCardTable: (routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo('history', routeParams, routeOptions));
    },
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
  });
};

class components_tables_paymentcardchippopover extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  navigateToDetails = () => {
    if (_try(() => this.props.modals.length)) this.props.closeModal();
    const { refId, paymentCards } = this.props;
    const paymentCard = paymentCards[refId];

    this.props.goToPaymentCardTable({ card: paymentCard.id, tab: 'paymentCards' });
  }

  render() {
    const { refId, paymentCards, vCards, paymentCardsVCardMetadata } = this.props;
    const paymentCard = paymentCards[refId];
    const paymentCardVCardMetadata = _try(() => paymentCardsVCardMetadata[refId], {});
    const virtualCard = _try(() => vCards[paymentCard.vCard], {});
    const data = {
      ...paymentCard,
      ...paymentCardVCardMetadata,
      status: virtualCard.status || paymentCard.status,
      dateCreated: paymentCard._createdAt,
    };

    return (
      <div className="components_tables_paymentcardchippopover">
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
              <td><Components.badges.status data={data.status.split('_').reduce((acc, cur, index) => { return `${acc}${index > 0 ? ' ' : ''}${cur.charAt(0).toUpperCase()}${cur.slice(1)}`; }, '')} /></td>
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
              <td>{numeral(_try(() => data.remainingBalance)).format('$0,0.00')}</td>
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

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_paymentcardchippopover);


