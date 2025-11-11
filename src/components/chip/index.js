/* eslint-disable react/no-did-update-set-state */
import { connect, Component } from 'component';

// Third Party Imports ...
import { Popover } from 'reactstrap';


// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  paymentCards: state.account.paymentCards.data.items,
  paymentStatuses: state.account.paymentStatuses.data.items,
  oldIdPaymentStatuses: state.account.paymentStatuses.collections._oldIds,
  pCards: _try(() => state.account.cardsIntegration.data.resources.pCards, {}),
  expenseReports: _try(() => state.account.expenseReports.data.items, {}),
  transfers: Selectors.tableData.csrtransfers(state),
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_chip extends Component {

  state = {
    // hacky smacky way to generate unique chip IDs for purpose of popover targetting
    chipId: `_${Math.floor(Math.random() * 1000)}`,
    popoverOpen: false,
  };

  componentDidMount() {
    this.componentDidUpdate(this.props);
  }

  componentDidUpdate(prevProps) {
    if ((this.props.refId !== prevProps.refId) || (!this.state.chipRef && this.props.refId)) {
      const {
        refId, paymentCards, paymentStatuses, oldIdPaymentStatuses, pCards, expenseReports, transfers,
      } = this.props;
      if (paymentCards[refId]) {
        this.setState({ chipRef: `C_${paymentCards[refId]._ref}` });
      } else if (paymentStatuses[refId]) {
        this.setState({ chipRef: `P_${paymentStatuses[refId]._ref}` });
      } else if (oldIdPaymentStatuses[refId] && paymentStatuses[oldIdPaymentStatuses[refId][0]]) {
        this.setState({ chipRef: `P_${paymentStatuses[oldIdPaymentStatuses[refId][0]]._ref}` });
      } else if (pCards[refId]) {
        this.setState({ chipRef: `*${pCards[refId].cardLast4 || pCards[refId].cardNumberLastFour || 'xxxx'}` });
      } else if (expenseReports[refId]) {
        this.setState({ chipRef: `E_${expenseReports[refId]._ref}` });
      } else if (transfers[refId]) {
        this.setState({ chipRef: `T_${transfers[refId]._ref}` });
      }
    } else if (!this.props.refId) { this.setState({ chipRef: '' }); }
  }

  toggleDetails = () => {
    this.setState({ popoverOpen: !this.state.popoverOpen });
  };

  openDetails = (e) => {
    e.stopPropagation();
    this.toggleDetails();
  };

  render() {
    const { chipId, popoverOpen, chipRef } = this.state;
    const { refId } = this.props;
    const modes = {
      P: {
        name: 'Payment',
        color: 'secondary',
      },
      T: {
        name: 'Transfer',
        color: 'secondary',
      },
      C: {
        name: 'Purchase Card',
        color: 'secondary',
      },
      I: {
        name: 'Issue',
        color: 'danger',
      },
      E: {
        name: 'Expense Report',
        color: 'secondary',
      },
      '*': {
        name: 'Plastic Card',
        color: 'secondary',
      },
    };

    if (chipRef) {
      const mode = modes[chipRef[0]];
      return (
        <div className="components_chip">
          <span
            role="tooltip"
            onClick={this.openDetails}
            id={chipId}
            className={`badge rounded-pill bg-${mode.color}`}
          >
            {chipRef}
            {
              popoverOpen
              && (
                <Popover
                  placement="left"
                  isOpen={popoverOpen}
                  target={chipId}
                  toggle={this.toggleDetails}
                  trigger="legacy"
                  className="chip-component-popover"
                >
                  {
                    (mode.name === 'Payment')
                    && <Components.tables.paymentchippopover refId={refId} />
                  }
                  {
                    (mode.name === 'Purchase Card')
                    && <Components.tables.paymentcardchippopover refId={refId} />
                  }
                  {
                    (mode.name === 'Plastic Card')
                    && <Components.tables.plasticcardchippopover refId={refId} />
                  }
                  {
                    (mode.name === 'Expense Report')
                    && <Components.tables.expenseReportChipPopover refId={refId} />
                  }
                  {
                    (mode.name === 'Transfer')
                    && <Components.tables.transferChipPopover refId={refId} />
                  }
                </Popover>
              )
            }
          </span>
        </div>
      );
    }
    return <span />;

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_chip);
