import { connect, Component } from 'component';
import Components from 'components';

import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_cards_joberror extends Component {
  render() {
    const { data } = this.props;
    switch (data.type) {
      case 'wfsTransfers':
        return (
          <div className="components_cards_joberror">
            <div className="p-4">
              <div className="card card-with-label small-padding">
                <p className="card-label px-1"><strong>Overview</strong></p>
                <div className="card-body">
                  <div className="flex">
                    <p className="text-muted mb-2">
                      Job Date: <strong>{new Date(data.timestamp).toDateString()}</strong>
                    </p>
                    <p className="text-muted mb-2">
                      File Date: <strong>{data.metadata.dateCreated}</strong>
                    </p>
                    <div />
                  </div>
                  <div className="flex">
                    <p className="text-muted mb-2">
                      Date: <strong>{new Date(data.lastErrorAt).toDateString()}</strong>
                    </p>
                    <p className="text-muted mb-2">
                      Retries Attempted: <strong>{data.errorCount}</strong>
                    </p>
                    <Components.actionsButton
                      containerClassNames={'action-button-container pb-1'}
                      id={'withdrawal-actions'}
                      actionContent={this.props.actionButtonOptions}
                      buttonClassNames="btn btn-secondary"
                    />
                  </div>
                  <p className="text-muted mb-2">Error: <strong>{data.lastError}</strong></p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'wfsTransactions':
        return (
          <div className="components_cards_joberror">
            <div className="p-4">
              <div className="card card-with-label small-padding">
                <p className="card-label px-1"><strong>Overview</strong></p>
                <div className="card-body">
                  <div className="flex">
                    <p className="text-muted mb-2">
                      Date Created: <strong>{new Date(data.timestamp).toDateString()}</strong>
                    </p>
                    <p className="text-muted mb-2">
                      WEX File Name: <strong>{data.metadata.name}</strong>
                    </p>
                    <div />
                  </div>
                  <div className="flex">
                    <p className="text-muted mb-2">
                      Date: <strong>{new Date(data.lastErrorAt).toDateString()}</strong>
                    </p>
                    <p className="text-muted mb-2">
                      Retries Attempted: <strong>{data.errorCount}</strong>
                    </p>
                    <Components.actionsButton
                      containerClassNames={'action-button-container pb-1'}
                      id={'withdrawal-actions'}
                      actionContent={this.props.actionButtonOptions}
                      buttonClassNames="btn btn-secondary"
                    />
                  </div>
                  <p className="text-muted mb-2">
                    Error: <strong>{data.lastError}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="components_cards_joberror">
            <div className="p-4">
              <div className="card card-with-label small-padding">
                <p className="card-label px-1"><strong>Overview</strong></p>
                <div className="card-body">
                  <div className="flex">
                    <p className="text-muted mb-2">
                      Date: <strong>{new Date(data.lastErrorAt).toDateString()}</strong>
                    </p>
                    <p className="text-muted mb-2">
                      Retries Attempted: <strong>{data.errorCount}</strong>
                    </p>
                    <Components.actionsButton
                      containerClassNames={'action-button-container pb-1'}
                      id={'withdrawal-actions'}
                      actionContent={this.props.actionButtonOptions}
                      buttonClassNames="btn btn-secondary"
                    />
                  </div>
                  <p className="text-muted mb-2">Error: <strong>{data.lastError}</strong></p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_cards_joberror);
