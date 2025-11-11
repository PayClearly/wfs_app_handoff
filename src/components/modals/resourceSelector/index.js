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

class components_modals_resourceSelector extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <div className="modal-dialog wide-modal wide-80">
        <div className="modal-content components_modals_resourceSelector">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">Select Resources</h3>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {this.props.toRender}
          </div>
          <div className="modal-footer">
            <Components.forms.components.resourceSelector.selectedCounter form={this.props.form} resourcesName={this.props.resourcesName} />
            <button
              onClick={this.props.close}
              className="btn btn-primary"
              type="button"
              aria-label="close button"
              disabled={false}
            >Continue</button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_resourceSelector);


