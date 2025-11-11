import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import { PopoverHeader, PopoverBody } from 'reactstrap';

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    pCards: state.account.cardsIntegration.data.resources.pCards,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    goToPlasticCardTable: (routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo('history', routeParams, routeOptions));
    },
  });
};

class components_tables_plasticcardchippopover extends Component {




  navigateToDetails = () => {
    const { refId } = this.props;
    this.props.goToPlasticCardTable({ card: refId, tab: 'pCards' });
  }

  render() {
    const { refId, pCards } = this.props;
    const card = pCards[refId];

    return (
      <div className="components_tables_plasticcardchippopover">
        <PopoverHeader className="chip-popover-header">
          <span>
            <i className="mdi mdi-credit-card-outline me-1" />
            Plastic Card Details
          </span>
          <i role="tooltip" className="mdi mdi-link float-end" onClick={this.navigateToDetails} />
        </PopoverHeader>
        <PopoverBody>
          <table>
            <tr>
              <td className="md-1">Name:</td>
              <td className="md-2">{_try(() => card.cardHolderName)}</td>
            </tr>
            <tr className="md-3">
              <td>Status:</td>
              <td><Components.badges.status data={card.status} /></td>
            </tr>
            <tr>
              <td>Created:</td>
              <td>{Utils.dates.dateToDay(card._createdAt, 'dayOnly')}</td>
            </tr>
            <tr>
              <td>Memo:</td>
              <td>{card.cardMemo}</td>
            </tr>
            <tr>
              <td>Valid Through:</td>
              <td>{_formatValidThrough(card.expireDate)}</td>
            </tr>
            <tr>
              <td>Card #:</td>
              <td>*{_try(() => card.cardLast4 || card.cardNumberLastFour) || '***'}</td>
            </tr>
          </table>
        </PopoverBody>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_plasticcardchippopover);

// Internal Helper Functions ...
const _formatValidThrough = (date) => {
  if (date === '0' || !date) return '';
  return `${date.slice(4)}-${date.slice(0, 4)}`;
};

