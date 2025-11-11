import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    passwordsIntegration: Selectors.integrations(state).passwordsIntegration || {},
    context: Selectors.context(state),
    form: _try(() => state.forms['Components.forms.passworsdIntegration._1PASSWORD'].default, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createIntegration: (data) => {
      dispatch(Store.account.linkIntegration('passwordsIntegration', { ...data, provider: props.provider }));
    },
    clearStatusErrors: () => { },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_integrationsetups_passwordsIntegration_1PASSWORD extends Component {

  state = {
    showCreatedNotification: false,
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onSubmit() {
    this.props.createIntegration({ ...this.props.form._values });
  }

  onCreate() {
    this.setState({
      showCreatedNotification: true,
    });
  }


  render() {
    const status = this.props.passwordsIntegration.status;
    const creating = this.props.passwordsIntegration.status.creating;
    const disabled = creating || !_try(() => this.props.form._allValid);
    const error = this.props.passwordsIntegration.status.creatingError;

    return (
      <div className="components_integrationsetups_passwordsIntegration_1PASSWORD">
        <h5>Please provide the following information to link with 1Password</h5>
        <Components.creators.creatorwrapper
          className="components_integrationsetups_passwordsIntegration_1PASSWORD"
          canCreate
          createFormActive
          status={status}
          onCreate={() => this.onCreate()}
          clearStatusErrors={this.props.clearStatusErrors}
        >
          <Fragment>
            <Components.forms.passwordsIntegration._1PASSWORD />
            {error &&
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Something Went Wrong</h4>
                Error: {error}
              </div>
            }
            {this.state.showCreatedNotification &&
              <div className="alert alert-primary" role="alert">
                Account is now linked with 1Password!
              </div>
            }
            <Components.button
              className="btn btn-primary"
              buttonText="Create"
              onClick={() => this.onSubmit()}
              ariaLabel="Create Link with 1Password"
              updating={creating}
              disabled={disabled}
              onDisabledClick={() => { }}
            />
          </Fragment>
        </Components.creators.creatorwrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationsetups_passwordsIntegration_1PASSWORD);

