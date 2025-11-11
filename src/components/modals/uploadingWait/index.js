import { connect, Component } from 'component';

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

class components_modals_uploadingWait extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <div className="modal-dialog components_modals_uploadingWait">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Creating {this.props.itemsDisplay}</h5>
          </div>
          <div className="modal-body" style={{ justifyContent: 'center' }}>
            <p>Your {this.props.itemsDisplay} are being created. This process may take several minutes, please remain on this page until it is complete.</p>
            <Components.spinner />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_uploadingWait);


