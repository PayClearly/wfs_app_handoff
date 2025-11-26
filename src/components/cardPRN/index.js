/* eslint-disable arrow-body-style */
import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

import Store from 'store';
import Components from 'components';

const mapStateToProps = (state, props) => ({
  cardPRNs: (state.account.privateCardPRN || { data: {} }).data.items,
  organizationId: state.organization.data.id,
  accountId: state.account.data.id,
  fetched: state.account.privateCardPRN && state.account.privateCardPRN.status && state.account.privateCardPRN.status.fetched,
});

const mapDispatchToProps = (dispatch, props) => ({
  fetchCardPRNs: ({ organizationId, accountId, cardIds }) => {
    return dispatch(Store.account.privateCardPRN.fetch({ organizationId, accountId, cardIds }));
  },
  clear: () => dispatch(Store.account.privateCardPRN.clear()),
});

class componentsCardPRN extends Component {
  state = {
    hasCopied: false,
  };

  componentDidMount() {
    // Card PRN should be fetched only when needed, rather than synced
    this.props.fetchCardPRNs({
      organizationId: this.props.organizationId,
      accountId: this.props.accountId,
      cardIds: [this.props.cardId],
    });
  }

  componentWillUnmount() {
    // Card PRN should be cleared from store as soon as possible
    this.props.clear();
  }

  onCopy = () => {
    this.setState(
      { hasCopied: true },
      () => {
        setTimeout(() => { this.setState({ hasCopied: false }); }, 800);
      }
    );
  };

  render() {
    if (!this.props.fetched) { return <Components.spinner />; }
    const cardPRN = (this.props.cardPRNs || {})[this.props.cardId];
    return (
      <div className="components_cardprn">
        <strong>Card PRN</strong>
        <Components.clicktocopytextwrapper onCopy={this.onCopy} showTooltip={false} value={cardPRN}>
          <div
            className="text-muted mb-2"
          >
            {cardPRN}
          </div>
        </Components.clicktocopytextwrapper>
        {
          this.state.hasCopied
          && (
            <div className="alert alert-primary copied-alert" style={{ position: 'absolute', left: '10px' }}>
              <strong>Copied to Clipboard!</strong>
            </div>
          )
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsCardPRN);

