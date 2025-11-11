import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import numeral from 'numeral';
import { PopoverHeader, PopoverBody } from 'reactstrap';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    transfers: Selectors.tableData.csrtransfers(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: () => {
      dispatch(Store.router.closeModal());
    },
    goToTranfers: (...args) => {
      dispatch(Store.router.navigateTo('funding', ...args));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_tables_transferChipPopover extends Component {




  navigateToDetails = () => {
    const transferId = this.props.refId || null;
    this.props.closeModal();
    this.props.goToTranfers({ transferId });
  }

  render() {
    const { transfers, refId } = this.props;
    const transfer = _try(() => transfers[refId], {});
    return (
      <div className="components_tables_transferChipPopover">
        <PopoverHeader className="chip-popover-header">
          <span>
            <i className="mdi mdi-cash-multiple me-1" />
            Transfer Details
          </span>
          <i role="tooltip" className="mdi mdi-link float-end" onClick={this.navigateToDetails} />
        </PopoverHeader>
        <PopoverBody>
          <table>
            <tr>
              <td>Amount:</td>
              <td>{numeral(transfer.amount.value).format('$0,0.00')}</td>
            </tr>
            <tr>
              <td className="me-3">Status:</td>
              <td><Components.badges.fundingtransferstatus status={transfer.status} /></td>
            </tr>
            <tr>
              <td>Created Date:</td>
              <td>{Utils.dates.dateToDay(transfer._createdAt, 'dateFormatUS')}</td>
            </tr>
            <tr>
              <td>Note:</td>
              <td>{transfer.note}</td>
            </tr>
          </table>
        </PopoverBody>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_transferChipPopover);


