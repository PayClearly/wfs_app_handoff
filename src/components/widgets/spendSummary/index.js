import { connect, Component } from 'component';

import numeral from 'numeral';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => ({
  accountItem: state.accounts.data.items[state.account.data.id],
  integrationAccount: _try(() => state.account.cardsIntegration.data.resources.accounts.default, {}),
  spendSummary: _try(() => Selectors.spendSummary(state)),

});

const mapDispatchToProps = (dispatch, props) => ({});

const mapResourcesToProps = (state, props) => ({});

class components_widgets_spendSummary extends Component {

  state = {
    popoverOpen: false,
  };

  componentDidMount() { }

  componentWillUnmount() { }

  togglePopover = () => {
    this.setState((prevState) => ({ popoverOpen: !prevState.popoverOpen }));
  };

  formatInflow = (value) => <h2 className="font-light mb-0 text-end"><i className={`mdi mdi-${value >= 0 ? 'plus' : 'minus'} text-${value >= 0 ? 'success' : 'danger'}`} />{numeral(Math.abs(value)).format('$0,0.00')}</h2>;

  formatNoflow = (value) => <h2 className="font-light mb-0 text-end">{numeral(Math.abs(value)).format('$0,0.00')}</h2>;

  formatOutflow = (value) => <h2 className="font-light mb-0 text-end"><i className={`mdi mdi-${value < 0 ? 'plus' : 'minus'} text-${value < 0 ? 'success' : 'danger'}`} />{numeral(Math.abs(value)).format('$0,0.00')}</h2>;

  render() {
    const { spendSummary, accountItem } = this.props;
    const loaded = !!_try(() => spendSummary);

    return (
      <div className="card widget-small components_widgets_spendSummary" role="ToolTip" id="funds-details" onClick={loaded && this.togglePopover}>
        <div className="card-body">
          <h4 className="card-title">Available <span className="text-nowrap">Funds<i className={`mdi mdi-chevron-${this.state.popoverOpen ? 'down' : 'right'}`} /></span></h4>
          {
            loaded
              ? <h2 className="font-light mb-0 text-truncate"><i className={`mdi mdi-${spendSummary.availableBalance >= 0 ? 'plus' : 'minus'} text-${spendSummary.availableBalance >= 0 ? 'success' : 'danger'}`} />{spendSummary.availableBalance >= 1000000 ? numeral(Math.abs(spendSummary.availableBalance)).format('($ 0.00a)') : numeral(Math.abs(spendSummary.availableBalance)).format('$0,0.00')}</h2>
              : <Components.horizontalLoader />
          }
        </div>
        {
          loaded
          && (
            <Popover
              placement="bottom"
              isOpen={this.state.popoverOpen}
              target="funds-details"
              toggle={this.togglePopover}
              trigger="legacy"
              className="popover-override"
            >
              <PopoverHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <div>Available Funds Details</div>
                  <i className="mdi mdi-close close" style={{ cursor: 'pointer' }} onClick={this.togglePopover} />
                </div>
              </PopoverHeader>
              <PopoverBody>
                {/* {accountItem.suspended ?
                    <div className="alert alert-danger" role="alert" style={{ maxWidth: '26rem' }}>
                      {'This account is currently suspended. Please contact your account administrator to get this resolved.'}
                    </div>
                    : null
                  } */}
                <div className="d-flex justify-content-between align-items-center" style={{ borderBottom: 'solid 1px rgb(220, 220, 220)' }}>
                  <h3 className="text-muted mb-0">Credit Limit</h3>
                  {this.formatNoflow(this.props.integrationAccount.creditLimit || 0)}
                </div>


                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="text-muted mb-0">Total Available:&nbsp;&nbsp;</h3>
                  {this.formatInflow(spendSummary.availableBalance)}
                </div>
              </PopoverBody>
            </Popover>
          )
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_widgets_spendSummary);


