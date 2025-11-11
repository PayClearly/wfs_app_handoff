import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    privateVirtualCard: state.account.privateVirtualCard,
    vCards: _try(() => state.account.cardsIntegration.data.resources.vCards),
    users: state.users,
    account: state.account,
    accounts: state.accounts,
    organization: state.organization,
    organizations: state.organizations,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    setPrivateCard: (id) => {
      dispatch(Store.account.fetchPrivateVirtualCards([id]));
    },
    clearPrivateCard: () => {
      dispatch(Store.account.clearPrivateVirtualCard());
    },
  });
};

class components_modals_virtualcard extends Component {
  componentDidMount() {
    this.props.setPrivateCard(this.props.id);
  }

  componentWillUnmount() {
    this.props.clearPrivateCard();
  }

  render() {
    const card = this.props.privateVirtualCard.data.items[this.props.id];
    const vCard = this.props.vCards[this.props.id] || {};
    const createdById = vCard._createdBy;
    const cardType = vCard.cardType;
    const createdBy = this.props.users.data.items[createdById];
    const loading = !card;
    const accountName = this.props.accounts.data.items[this.props.account.data.id].name;
    const organizationName = this.props.organizations.data.items[this.props.organization.data.id].name;
    const logo = this.props.accounts.data.items[this.props.account.data.id].virtualCardLogo;

    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content components_modals_virtualcard">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">{this.props.name ? this.props.name : 'Generated Card'}</h5>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md mb-4" >
                <div className="flex-center">
                  <Components.virtualcard cardType={cardType} loading={loading} privateCardData={card} createdBy={createdBy} logo={logo} showCopierTooltip />
                </div>
              </div>
            </div>
            {(!loading && (
              <div className="row mb-4 mt-4 pt-2">
                <div className="col">
                  <strong>Organization</strong>
                  <p className="text-muted mb-2">{organizationName}</p>
                  <strong>Card Number</strong><br />
                  <Components.clicktocopytextwrapper showTooltip value={card.cardNumber}>
                    <p className="text-muted mb-2">
                      {card.cardNumber}<i className="mdi mdi-credit-card-plus-outline ms-2" />
                    </p>
                  </Components.clicktocopytextwrapper>
                  <strong>Expiration</strong>
                  <p className="text-muted mb-2">{card.cardExpirationMonth && `${card.cardExpirationMonth} / ${card.cardExpirationYear.slice(2, 4)}`}</p>
                </div>
                <div className="col">
                  <strong>Account</strong>
                  <p className="text-muted mb-2">{accountName}</p>
                  <strong>CVV</strong>
                  <p className="text-muted mb-2">{card.cardcvv}</p>
                  <strong>Amount</strong>
                  <p className="text-muted mb-2">${(vCard.amount && parseFloat(vCard.amount).toFixed(2)) || ''}</p>
                </div>
              </div>)
            ) || (
                <div className="row mb-4 mt-4 pt-2">
                  <div className="col">
                    <div className="flex-center">
                      <Components.spinner />
                    </div>
                  </div>
                </div>
              )}
          </div>
          <div className="modal-footer">

            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={this.props.close}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_virtualcard);


