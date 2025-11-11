import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    cardsIntegration: Selectors.integrations(state).cardsIntegration || {},
    context: Selectors.context(state),
    form: _try(() => state.forms['Components.forms.cardsIntegration.EFS'].default, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createIntegration: (data) => {
      dispatch(Store.account.linkIntegration('cardsIntegration', { ...data, provider: 'EFS' }));
    },
    clearStatusErrors: () => { },
  });
};

class components_integrationsetups_cardsintegration_EFS extends Component {

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
    const status = this.props.cardsIntegration.status;
    const creating = this.props.cardsIntegration.status.creating;
    const disabled = creating;
    const error = this.props.cardsIntegration.status.creatingError;

    return (
      <div className="components_integrationsetups_cardsintegration_EFS">
        <p>Please provide the following information to link with EFS</p>
        <Components.creators.creatorwrapper
          className="components_integrationsetups_cardsintegration_EFS"
          canCreate
          createFormActive
          status={status}
          onCreate={() => this.onCreate()}
          clearStatusErrors={this.props.clearStatusErrors}
        >
          <Fragment>
            <Components.forms.cardsIntegration.EFS initialFormData={{}} />
            {error &&
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Something Went Wrong</h4>
                Error: {error}
              </div>
            }
            {this.state.showCreatedNotification &&
              <div className="alert alert-primary" role="alert">
                Account is now linked with EFS!
              </div>
            }
            <Components.button
              className="btn btn-primary"
              buttonText="Create"
              onClick={() => this.onSubmit()}
              ariaLabel="Create Link with EFS"
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

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationsetups_cardsintegration_EFS);


