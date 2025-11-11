import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    privateMetadata: state.user.privateMetadata.data.item,
    twoFactorAuthStatus: state.user.twoFactorAuth.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    remove: (data) => {
      return dispatch(Store.user.removeTwoFactorAuth(data));
    },
  });
};

class components_modals_removetwofactorauth extends Component {

  state = {
    forms: {},
  };

  componentDidMount() { }
  componentWillReceiveProps(nextProps) {
    this.setState({ forms: nextProps.forms });

    if (this.props.privateMetadata.twoFactorAuthVerified && !nextProps.privateMetadata.twoFactorAuthVerified) {
      this.props.close();
    }
  }
  componentWillUnmount() { }

  handleRemove = () => {
    this.props.remove(this.props.forms['Components.forms.verifytwofactordevice'].default._values.token);
  };

  render() {

    const form = this.state.forms['Components.forms.verifytwofactordevice'] &&
      this.state.forms['Components.forms.verifytwofactordevice'].default;
    const updating = this.props.twoFactorAuthStatus.deleting;

    return (
      <div className="modal-dialog components_modals_removetwofactorauth" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title" id="exampleModalLabel">Remove Two Factor Auth</h2>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row mt-3">
              <div className="col-md mb-4" >
                <Components.containers.verifytwofactordevice
                  hideRememberMe
                />
              </div>
            </div>
            <div className="modal-footer">
              <div className="row float-end">
                <Components.button
                  buttonText={'Cancel'}
                  onClick={() => { this.props.close(); }}
                  ariaLabel="Cancel"
                  className="btn btn-secondary me-4"
                  disabled={updating}
                />
                <Components.button
                  buttonText={'Submit'}
                  onClick={this.handleRemove}
                  ariaLabel="Submit"
                  className="btn btn-primary waves-effect z-depth-5dp float-end"
                  updating={updating}
                  disabled={!form || !form._allValid}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_removetwofactorauth);


