import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    erpIntegration: Selectors.integrations(state).erpIntegration || {},
    context: Selectors.context(state),
    form: _try(() => state.forms['Components.forms.erpIntegration.ADVANTAGE'].default, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createIntegration: (data) => {
      dispatch(Store.account.linkIntegration('erpIntegration', { ...data, provider: 'ADVANTAGE' }));
    },
    clearStatusErrors: () => { },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_integrationsetups_erpintegration_ADVANTAGE extends Component {

  state = {
    showCreatedNotification: false,
  };




  onSubmit() {
    this.props.createIntegration({ ...this.props.form._values });
  }

  onCreate() {
    this.setState({
      showCreatedNotification: true,
    });
  }


  render() {
    const status = this.props.erpIntegration.status;
    const creating = this.props.erpIntegration.status.creating;
    const disabled = creating || !_try(() => this.props.form._allValid);
    const error = this.props.erpIntegration.status.creatingError;

    return (
      <div className="components_integrationsetups_erpintegration_ADVANTAGE">
        <h5>Please provide the following information to link with Advantage</h5>
        <Components.creators.creatorwrapper
          className="components_integrationsetups_erpintegration_ADVANTAGE"
          canCreate
          createFormActive
          status={status}
          onCreate={() => this.onCreate()}
          clearStatusErrors={this.props.clearStatusErrors}
        >
          <Fragment>
            <Components.forms.erpIntegration.ADVANTAGE />
            {error &&
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Something Went Wrong</h4>
                Error: {error}
              </div>
            }
            {this.state.showCreatedNotification &&
              <div className="alert alert-primary" role="alert">
                Account is now linked with Advantage!
              </div>
            }
            <Components.button
              className="btn btn-primary"
              buttonText="Create"
              onClick={() => this.onSubmit()}
              ariaLabel="Create Link with Advantage"
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

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationsetups_erpintegration_ADVANTAGE);


