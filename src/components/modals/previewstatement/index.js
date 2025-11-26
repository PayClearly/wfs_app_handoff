import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    fetchAttachment: (attachmentMetadata) => {
      return dispatch(Store.global.fetchAttachment(attachmentMetadata));
    },
  });
};

class components_modals_previewstatement extends Component {

  render() {
    return (
      <div className="modal-dialog components_modals_previewstatement" style={{ width: '85%', maxWidth: '100%' }} role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">Statement Preview</h3>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <Components.containers.pdf pdf={this.props.attachment} />
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

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_previewstatement);

