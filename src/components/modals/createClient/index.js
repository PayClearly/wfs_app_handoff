import { connect, Component, bindActionCreators, Fragment } from 'component';

import Components from 'components';

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

class components_modals_createClient extends Component {




  render() {
    return (
      <div className="modal-dialog wide-modal wide-70">
        <div className="modal-content components_modals_createClient">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Create Client</h5>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <Components.creators.client
              close={this.props.close}
              initialData={{ name: this.props.text }}
              formKey="create"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_createClient);


