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

class components_modals_createClientVendorLink extends Component {
  state = {
    formKey: 'create',
    blurAll: false,
  };

  componentDidMount() {}
  componentWillUnmount() {}

  // onSubmit = () => {
  //   const form = _try(() => this.props.forms['Components.forms.clientVendorLink'][this.state.formKey], {});
  //   const data = {
  //     ...form._values,
  //   };
  //   const _id = `${data.clientId}${clientVendorLinkIdSeparator}${data.vendorId}`;

  //   const credentialsForm = _try(() => this.props.forms[form._children[0].name][form._children[0].key], {});
  //   if (credentialsForm) data.credentials = credentialsForm._values;

  //   return this.props.createClientVendorLink(_id, data);
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
// const clientVendorLinkIdSeparator = '-';

// GENERATOR_TYPE='component';
