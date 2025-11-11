import { connect, Component, bindActionCreators, Fragment } from 'component';

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    paymentCards: state.account.paymentCards.data.items,
    vCards: _try(() => state.account.cardsIntegration.data.resources.vCards),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_modals_transactionhistory extends Component {




  render() {
    let title = 'Transaction History';

    if (this.props.paymentCardId && this.props.paymentCards[this.props.paymentCardId]) {
      const name = this.props.paymentCards[this.props.paymentCardId].name;
      const ref = this.props.paymentCards[this.props.paymentCardId]._ref;
      title = `Transaction History for Purchase Card${name || ref ? ':' : ''}${name && ` ${name}`}${ref && ` (Ref # C_${ref})`}`;
    } else if (this.props.vCards && this.props.vCards[this.props.id]) {
      title = `Transaction History for Card *${this.props.vCards[this.props.id].cardNumberLastFour}`;
    }

    return (
      <div className="modal-dialog wide-modal wide-80" role="document">
        <div className="modal-content h-100 w-100 components_modals_transactionhistory">
          <div className="modal-header">
            <h4 className="modal-title" id="exampleModalLabel">
              {title}
            </h4>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            <Components.tables.virtualcardtransactionhistory
              tableKey={this.props.id}
              initialTableStateOverride={{ filters: { cardId: { key: 'cardId', type: 'string', comparator: 'equals', value: this.props.id } } }}
            />
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

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_transactionhistory);


