import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    pCard: _resolve(state, `account.cardsIntegration.data.resources.pCards.${props.id}`),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_modals_reissueplasticcard extends Component {

  componentDidMount() {}
  componentWillReceiveProps(nextProps) {
    const { id } = nextProps;
    const pCard = nextProps.pCards[id];

    if (pCard.issueStatus === 'requested') this.props.close();
  }
  componentWillUnmount() {}

  render() {
    const { pCard, id } = this.props;
    return (
      <div className="modal-dialog components_modals_reissueplasticcard w-80" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Reissue Plastic Card {_formatLastFour(pCard.cardLast4 || pCard.cardNumberLastFour || '')}</h5>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <Components.creators.plastic
              forReissue
              close={this.props.close}
              id={id}
              initialFormData={pCard}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_reissueplasticcard);

// Internal Helper Functions ... 
const _formatLastFour = (lastFour) => {
  return `*${numeral(lastFour).format('0000')}`;
};
