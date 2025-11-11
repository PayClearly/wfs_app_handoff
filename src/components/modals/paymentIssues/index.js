import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_modals_paymentIssues extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <div className="modal-dialogue wide-modal wide-70 components_modals_paymentIssues" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">Payment Issues</h3>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <Components.tables.paymentIssues />
          </div>
          <div className="modal-footer">
            <button
              onClick={() => { this.props.close(); }}
              className="btn btn-danger"
              type="button"
              aria-label={'close'}
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

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_paymentIssues);


