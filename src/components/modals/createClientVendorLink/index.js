import { connect, Component, bindActionCreators, Fragment } from 'component';

import Components from 'components';

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

class components_modals_createClientVendorLink extends Component {
  state = {
    formKey: 'create',
    blurAll: false,
  };

  componentDidMount() {}
  componentWillUnmount() {}

  //     ...form._values,
  //   };


  // }

  render() {
    return (
      <div className="modal-dialog wide-modal wide-70">
        <div className="modal-content components_modals_createClientVendorLink">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">Create Client-Vendor Links</h3>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <Components.uploaders.clientVendorLinks />
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

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_createClientVendorLink);

// Internal Helper Functions ... 

