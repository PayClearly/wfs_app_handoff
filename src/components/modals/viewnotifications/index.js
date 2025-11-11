import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_modals_viewnotifications extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <div className="modal-dialog wide-modal wide-80" role="document">
        <div className="modal-content h-100 w-100 components_modals_viewnotifications">
          <div className="modal-header">
            <h4 className="modal-title" id="exampleModalLabel">
              {this.props.title || 'Notification Details'}
            </h4>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            <div className="row">
              <div className="col-12">
                <Components.overviews.notifications notificationIds={this.props.notificationIds} doNotClearNotifications={this.props.doNotClearNotifications} />
              </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_viewnotifications);


