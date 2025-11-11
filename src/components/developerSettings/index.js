import { connect, Component } from 'component';
import { Collapse } from 'react-collapse';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    account: state.account,
    accounts: state.accounts,
    apiKeyPolicies: Selectors.entity('apiKeys_idOrganization_idAccount')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    syncApiKeys: () => {
      return dispatch(Store.apikeys.sync());
    },
    clearApiKeys: () => {
      return dispatch(Store.apikeys.clear());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_developerSettings extends Component {

  state = {
    account: null,
    hasCopiedSandboxKey: false,
    hasCopiedAccountId: false,
  };

  componentDidMount() {
    const account = this.props.accounts.data.items[this.props.account.data.id] || {};
    this.setState({
      account,
    });

    if (this.props.apiKeyPolicies.canRead) {
      this.props.syncApiKeys();
    }
  }
  componentWillReceiveProps(nextProps) {
    const account = nextProps.accounts.data.items[nextProps.account.data.id] || {};
    this.setState({
      account,
    });
  }
  componentWillUnmount() {
    if (this.props.apiKeyPolicies.canRead) {
      this.props.clearApiKeys();
    }
  }

  disabledCopiedNotifications = () => {
    this.setState({ hasCopiedSandboxKey: false, hasCopiedAccountId: false });
  }

  render() {
    const sandboxApiKey = 'eyJzZWNyZXQiOiJzb21ld3JvbmdzZWNyZXQiLCJvcmdhbml6YXRpb25JZCI6Im9yZy1mb3ItdGVzdGluZy1wb2xpY2llcyIsImFjY291bnRJZCI6ImFjY291bnQtZm9yLXRlc3RpbmctcG9saWNpZXMifQ==';

    return (
      <div className="components_developerSettings">
        {/* <Components.tab name="developer" label="Developer Settings" iconClassName="mdi-cog"> */}
        <h3>Account Id</h3>
        <Components.clicktocopytextwrapper
          value={this.props.account.data.id}
          onCopy={() => {
            this.setState({ hasCopiedAccountId: true, hasCopiedSandboxKey: false }, () => {
              setTimeout(() => this.setState({ hasCopiedAccountId: false }), 800);
            });
          }}
        >
          <div className="row mb-2">
            <div className="col-4">
              <p>{this.props.account.data.id}</p>
            </div>

            <div className="col-4">
              {this.state.hasCopiedAccountId && <span className="text-primary"><i className="mdi text-success mdi-check-circle-outline" /> Copied to Clipboard!</span>}
            </div>
          </div>
        </Components.clicktocopytextwrapper>

        <h3>API Keys</h3>
        <Components.button
          onClick={() => this.setState({ showSandboxKey: !this.state.showSandboxKey })}
          buttonText={(this.state.showSandboxKey) ? 'Hide Sandbox API Key' : 'Show Sandbox API Key'}
          icon="mdi mdi-key"
          iconLeft
          className="btn btn-secondary btn-sm mt-3 mb-1"
        />

        <Collapse isOpened={this.state.showSandboxKey}>
          <div className="pt-1">
            <div className="alert alert-secondary mb-0">
              <Components.clicktocopytextwrapper
                value={sandboxApiKey}
                onCopy={() => {
                  this.setState({ hasCopiedSandboxKey: true, hasCopiedAccountId: false }, () => {
                    setTimeout(() => { this.setState({ hasCopiedSandboxKey: false }); }, 800);
                  });
                }}
              >
                <div className="row">
                  <div className="col-12">
                    <span>{sandboxApiKey}</span>
                  </div>
                </div>
                <div className="d-flex justify-content-center text-secondary mt-1 mb-1">
                  {(this.state.hasCopiedSandboxKey)
                    ?
                    <span className="align-middle">
                      <i className="mdi h4 text-success fw-bold mdi-check-circle-outline me-1 align-middle" />
                      Copied to Clipboard!
                    </span>
                    :
                    <span className="align-middle">
                      <i className="mdi h4 mdi-clipboard-text-outline align-middle me-1" />
                      Click to Copy
                    </span>
                  }
                </div>
              </Components.clicktocopytextwrapper>
            </div>
          </div>
        </Collapse>
        <Components.creators.apiKey disabledCopiedNotifications={this.disabledCopiedNotifications} hasCopied={this.state.hasCopiedAccountId || this.state.hasCopiedSandboxKey} />
        <div className="mt-2">
          <Components.tables.apiKeys />
        </div>
        {/* </Components.tab> */}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_developerSettings);


