import { connect, Component } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Store from 'store';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    paymentStatus: state.account.paymentStatuses.data.items[props.id],
    vCards: _try(() => state.account.cardsIntegration.data.resources.vCards),
    isOps: state.appConfig.data.metadata.name === 'ops',
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    syncCardsintegration: (id) => { dispatch(Store.account.syncCardsIntegration(id)); },
  });
};

class components_modals_paymentstatusvirtualcards extends Component {

  componentDidMount() {
    if (this.props.isOps) this.props.syncCardsintegration(this.props.id);
  }

  render() {
    const { paymentStatus } = this.props;
    const fundedData = _try(() => paymentStatus.funded);

    return (
      <div className="modal-dialog wide-modal wide-80" role="document">
        <div className="modal-content h-100 w-100 components_modals_paymentstatusvirtualcards">
          <div className="modal-header">
            <h4 className="modal-title" id="exampleModalLabel">
              Virtual Cards
            </h4>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            <div className="row">
              {(() => {
                const cards = Object.values(fundedData.vCards || {});
                return cards.map((card, index) => {
                  return (
                    !this.props.vCards[card.id] ?
                      <Components.spinner /> :
                      <div className="col-12">
                        <h4>Card {index + 1} of {cards.length} - *{this.props.vCards[card.id].cardNumberLastFour} for {numeral(card.amount).format('$0,0.00')}</h4>
                        <Components.entities.virtualcard cardId={card.id} forPayment paymentStatus={paymentStatus} />
                      </div>
                  );
                });
              })()}
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={() => { this.props.close(); }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_paymentstatusvirtualcards);


