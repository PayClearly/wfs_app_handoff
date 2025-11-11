import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_modals_uploadClients extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <div className="modal-dialog wide-modal wide-70">
        <div className="modal-content components_modals_uploadClients">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">Add Clients</h3>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close Modal">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <Components.uploaders.clients />
          </div>
          <div className="modal-footer">
            <button
              onClick={this.props.close}
              className="btn btn-secondary"
              type="button"
              aria-label="Close Modal"
              disabled={false}
            >Close</button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_uploadClients);


