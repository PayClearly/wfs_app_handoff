import { connect, Component, bindActionCreators, Fragment } from 'component';
import Components from 'components';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_modals_jobstatus extends Component {

  state = {
    emailsSent: true,
  };




  render() {
    const disableButtons = false;
    const disableUpload = false;
    const sending = false;

    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content h-100 w-100 components_modals_jobstatus">
          <div className="modal-header">
            <h4 className="modal-title" id="jobStatus">
              {this.props.title || 'Job Status'}
            </h4>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            Modal Body Goes here
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={() => { if (disableButtons) return; this.props.close(); }}
              disabled={disableButtons}
            >
              Close
            </button>
            {!this.state.emailsSent &&
              <Components.button
                className="btn btn-primary"
                buttonText="Send"
                onClick={() => {
                  if (disableButtons || disableUpload) return;
                  // this.props.action();
                  this.setState({ clickedSend: true }, this.sendEmail);
                }}
                onDisabledClick={() => { this.setState({ blurAll: true }); }}
                ariaLabel="Send Email"
                updating={sending}
                disabled={disableButtons || disableUpload}
              />
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_jobstatus);


