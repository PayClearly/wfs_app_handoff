import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    invoices: state.account.invoices.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_modals_invoicepreview extends Component {




  render() {
    const invoice = this.props.invoices[this.props.id];
    return (
      <div className="modal-dialog components_modals_invoicepreview" style={{ width: '85%', maxWidth: '100%' }} role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">Invoice {invoice.invoiceNumber}</h3>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <Components.containers.image alt="Invoice Preview" path={invoice.attachment.storagePath} />
          </div>
          <div className="modal-footer">
            <button
              onClick={() => this.props.close()}
              className="btn btn-danger"
              type="button"
              aria-label="close"
              disabled={false}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_invoicepreview);


