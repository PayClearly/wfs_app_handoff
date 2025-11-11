import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import { Collapse } from 'react-collapse';
import uuid from 'uuid';
import btoa from 'btoa';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    status: state.apiKeys.status,
    organization: state.organization.data,
    account: state.account.data,
    apiKeyPolicies: Selectors.entity('apiKeys_idOrganization_idAccount')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    generateApiKey: (organizationId, accountId, data) => {
      return dispatch(Store.apikeys.create(organizationId, accountId, data));
    },
    openAreYouSureModal: (data) => {
      return dispatch(Store.router.openModal('Components.modals.areyousure', data));
    },
    clearErrors: () => {
      dispatch(Store.apikeys.clearErrors());
    },
  });
};

class components_creators_apiKey extends Component {
  state = {
    apiKey: '',
    showCreateForm: false,
    showCopiedNotification: false,
    hasCopied: false,
  }

  componentDidMount() { }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hasCopied) {
      this.setState({ hasCopied: false });
    }
  }

  componentWillUnmount() {
    this.props.clearErrors();
  }

  generateNewKey = () => {
    this.props.clearErrors();
    this.setState({ apiKey: '' });
    const { account, organization } = this.props;
    const { description } = this.props.forms['Components.forms.createApiKey'].default._values;
    const organizationId = organization.id;
    const accountId = account.id;
    const secret = uuid();
    return this.props.generateApiKey(organizationId, accountId, { secret, description })
      .then((id) => {
        if (!id) return null;
        const ids = {
          organizationId,
          accountId,
          secret,
          id,
        };

        const apiKey = btoa(JSON.stringify(ids));
        this.setState({ apiKey, showCreateForm: false });
      });
  }

  handleNewKeyWarning = () => {
    return this.props.openAreYouSureModal({
      title: 'Create New API Key',
      content: 'You\'re about to generate a new API key. It will only be displayed once. Make sure to copy it! Lost keys cannot be recovered.',
      noText: 'Cancel',
      yesText: 'I Understand',
      onYes: () => { return this.generateNewKey(); },
    });
  }

  renderCreateForm() {
    const disabled = !_try(() => this.props.forms['Components.forms.createApiKey'].default._allValid);
    const { creating, creatingError } = this.props.status;

    if (!this.state.showCreateForm) {
      return (
        <Components.button
          onClick={() => this.setState({ showCreateForm: true })}
          buttonText="Create New API Key"
          icon="mdi mdi-plus"
          iconLeft
          className="btn btn-primary btn-sm mt-1"
        />
      );
    }

    return (
      <Fragment>
        <div className="row">
          <div className="col-8">
            <Components.forms.createApiKey />
          </div>
          <div className="col-1 pt-3">
            <Components.button
              onClick={this.handleNewKeyWarning}
              buttonText="Generate"
              className="btn btn-primary btn-sm"
              disabled={disabled || creating}
              updating={creating}
            />
          </div>
          <div className="col-1 pt-3">
            <Components.button
              onClick={() => this.setState({ showCreateForm: false })}
              className="btn btn-primary btn-sm"
              buttonText="Cancel"
              disabled={creating}
              updating={creating}
            />
          </div>
        </div>
        <Collapse isOpened={creatingError}>
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            Error: {creatingError}
          </div>
        </Collapse>
      </Fragment>
    );
  }

  render() {
    return (
      <div className="components_creators_apiKey">
        <Components.creators.creatorwrapper
          canCreate={this.props.apiKeyPolicies.canCreate}
          createFormActive
        >
          <Fragment>
            <Collapse isOpened={this.state.apiKey !== ''}>
              <div className="row">
                <div className="col pt-2">
                  <div className="alert alert-warning mb-1">
                    <Components.clicktocopytextwrapper
                      value={this.state.apiKey}
                      onCopy={() => {
                        this.props.disabledCopiedNotifications();
                        this.setState({ hasCopied: true });
                      }}
                    >
                      <div className="row">
                        <div className="col-12">
                          <span>{this.state.apiKey}</span>
                        </div>
                      </div>
                      <div className="d-flex justify-content-center text-secondary">
                        {(this.state.hasCopied)
                          ?
                          <span className="align-middle">
                            <i className="mdi h4 text-success fw-bold mdi-check-circle-outline pe-1 align-middle" />
                            Copied to Clipboard!
                          </span>
                          :
                          <span className="align-middle">
                            <i className="mdi h4 mdi-clipboard-text-outline align-middle pe-1" />
                            Click to Copy
                          </span>
                        }
                      </div>
                    </Components.clicktocopytextwrapper>
                  </div>
                </div>
              </div>
            </Collapse>
            <Collapse isOpened>
              {this.renderCreateForm()}
            </Collapse>
          </Fragment>
        </Components.creators.creatorwrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_apiKey);


