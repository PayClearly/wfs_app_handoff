import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import classNames from 'classnames';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    access: state.user.access,
    email: state.user.profile.data.item.email,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    login: (jwtId, email, password) => {
      dispatch(Store.user.logBackIn(jwtId, email, password));
    },
  });
};

class components_modals_logbackin extends Component {


  componentWillReceiveProps(nextProps) {
    if (nextProps.access.data.canWrite) {
      this.props.close();
    }
  }


  loginClicked = () => {
    const form = this.props.forms['Components.forms.login'].logBackIn;
    this.props.login(this.props.access.data.jwt.jwtId, form.email.value, form.password.value);
  };


  render() {
    const form = (this.props.forms['Components.forms.login'] && this.props.forms['Components.forms.login'].logBackIn) || {};
    const updating = this.props.access.status.updating;
    const disabled = !form._allValid || updating;

    return (
      <div className="modal-dialog components_modals_logbackin" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title" id="exampleModalLabel">Login</h2>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row mt-3">
              <div className="col-md mb-4" >
                <br />
                <Components.forms.login
                  disableEmail
                  formKey="logBackIn"
                  initialFormData={{
                    email: this.props.email,
                  }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    this.loginClicked();
                  }}
                />

                {this.props.access.status.updatingError &&
                  <div className={classNames('alert', 'alert-danger')} role="alert">
                    {this.props.access.status.updatingError}
                  </div>
                }

                <div className={classNames('lb-body', 'pt-3')}>
                  <Components.button
                    buttonText="Sign In"
                    onClick={this.loginClicked}
                    onDisabledClick={() => this.setState({ blurAll: true })}
                    ariaLabel="Login"
                    className="btn btn-primary btn-lg waves-effect z-depth-5dp"
                    disabled={disabled}
                    updating={updating}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_logbackin);


