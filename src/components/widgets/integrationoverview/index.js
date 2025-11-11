import { connect, Component } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  details: state.account[props.integration].data.details,
  metas: state.account[props.integration].data.metas,
  policies: Selectors.entity(`${props.integration}_*_*`)(state),
});

const mapDispatchToProps = (dispatch, props) => ({
  syncQueues: (queue) => {
    dispatch(Store.account.syncIntegrationQueues(props.integration, queue));
  },
  openModal: (issueType) => {
    dispatch(
      Store.router.openModal(
        'Components.modals.integrationIssuesDetails',
        { integration: props.integration, issueType }
      )
    );
  },
});

// Internal Helper Functions ...
function _getIntegrationInfo(integration) {
  const integrationInfoMap = {
    achIntegration: {
      name: 'ACH',
      icon: 'bank',
    },
    cardsIntegration: {
      name: 'Cards',
      icon: 'credit-card-outline',
    },
    checksIntegration: {
      name: 'Checks',
      icon: 'email-outline',
    },
    erpIntegration: {
      name: 'ERP',
      icon: 'laptop',
    },
    fundingIntegration: {
      name: 'Funding',
      icon: 'cash-usd-outline',
    },
  };
  return integrationInfoMap[integration] || {};
}

// eslint-disable-next-line camelcase
class components_widgets_integrationoverview extends Component {

  handleResyncAll = () => {
    this.props.syncQueues('_sync');
    this.props.syncQueues('_queueHandler');
    this.props.syncQueues('queueHandler');
  };

  render() {
    const { name, icon } = _getIntegrationInfo(this.props.integration);

    if (!this.props.policies.canRead) {
      return null;
    }

    return (
      <div className="components_widgets_integrationoverview">
        <div
          className="body card col-lg-12"
          style={{ padding: '5px', marginBottom: this.props.last ? '0rem' : '.5rem' }}
        >
          <div className="row row-flex sb">
            <div style={{ display: 'flex', paddingLeft: 0 }}>
              <span style={{ fontSize: '28px' }}><i className={`mdi mdi-${icon}`} />{`${name} Integration`}</span>
            </div>
            {this.props.details.provider
              ? (
                <div>
                  <Components.button
                    buttonText="Sync All Queues"
                    onClick={this.handleResyncAll}
                    ariaLabel="View Integration Errors"
                    className="btn btn-outline-primary btn-sm mt-2 me-4"
                    icon="mdi mdi-sync"
                  />
                  <Components.button
                    buttonText="View Unlinked"
                    onClick={() => this.props.openModal('unlinked')}
                    ariaLabel="View Integration Errors"
                    className="btn btn-outline-secondary btn-sm mt-2 me-4"
                    icon="mdi mdi-link-off"
                  />
                  <Components.button
                    buttonText="View Errors"
                    onClick={() => this.props.openModal('errors')}
                    ariaLabel="View Integration Errors"
                    className="btn btn-outline-danger btn-sm mt-2 me-4"
                    icon="mdi mdi-cloud-download"
                  />
                </div>
              )
              : null}
          </div>
          <div className="row row-flex">
            <Components.badges.integrationlinkedstatus integration={this.props.integration} />
            {this.props.details.provider ? <p>{`Provider: ${this.props.details.provider}`}</p> : null}
          </div>
          <div className="row row-flex">
            <div className="col-md-5">
              <div className="row row-bottom-spacing">
                <p>Info</p>
              </div>
              <div className="row row-bottom-spacing grid two-columns">
                <p>Queue A: </p>
                <Components.badges.queuehealth type="queueHandler" integration={this.props.integration} />
              </div>
              <div className="row row-bottom-spacing grid two-columns">
                <p>Queue B: </p>
                <Components.badges.queuehealth type="_queueHandler" integration={this.props.integration} />
              </div>
              <div className="row row-bottom-spacing grid two-columns">
                <p>Sync: </p>
                <Components.badges.queuehealth type="_sync" integration={this.props.integration} />
              </div>
            </div>
            <div className="col-md-7">
              <div className="row row-bottom-spacing grid four-columns" style={{ marginLeft: '.35rem' }}>
                <p>Type</p>
                <p className="content">Count</p>
                <p className="content">Unlinked</p>
                <p className="content">Errors</p>
              </div>
              {Object.keys(this.props.metas || {}).map((key) => (
                <div className="row grid four-columns" style={{ marginLeft: '.35rem' }}>
                  <p>{key}</p>
                  <p className="content">{this.props.metas[key].count}</p>
                  <p className="content">{Object.keys(this.props.metas[key].unlinked || {}).length}</p>
                  <p className="content">{Object.keys(this.props.metas[key].errors || {}).length}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_widgets_integrationoverview);
