import { connect, Component } from 'component';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({});

const mapDispatchToProps = (dispatch, props) => ({});

class components_cards_jobprocessed extends Component {





  render() {
    const { data, actionButtonOptions } = this.props;

    const formatDate = (dateString) => dateString.split('T')[0];
    const formatDateRange = () => `${formatDate(data.metadata.startDate || data.timestamp)} - ${formatDate(data.metadata.endDate || data.timestamp)}`;
    const formatTimestamp = (dateString) => new Date(dateString).toLocaleString();

    function CardContent() {
      switch (data.type) {
        case 'createBatchPayment':
        case 'updateBatchPayment':
          return (
            <div className="card-body">
              <div className="flex">
                <p className="text-muted mb-2">Payment Id: <strong>{data.metadata.entityId}</strong></p>
                <p className="text-muted mb-2">Status to: <strong>{data.metadata.to}</strong></p>
                <Components.actionsButton
                  containerClassNames={'action-button-container pb-1'}
                  id={'withdrawal-actions'}
                  actionContent={actionButtonOptions}
                  buttonClassNames="btn btn-secondary"
                />
              </div>
              <p className="text-muted mb-2">Job created: <strong>{formatTimestamp(data.timestamp)}</strong></p>
            </div>
          );
        case 'paymentPipeline':
          return (
            <div className="card-body">
              <div className="flex">
                <p className="text-muted mb-2">Step name: <strong>{data.metadata.step.name}</strong></p>
                <p className="text-muted mb-2">Step status: <strong>{data.metadata.step.status}</strong></p>
                <Components.actionsButton
                  containerClassNames={'action-button-container pb-1'}
                  id={'withdrawal-actions'}
                  actionContent={actionButtonOptions}
                  buttonClassNames="btn btn-secondary"
                />
              </div>
              <p className="text-muted mb-2">Job created: <strong>{formatTimestamp(data.timestamp)}</strong></p>
            </div>
          );
        case 'transactionDetails':
          return (
            <div className="card-body">
              <div className="flex">
                <p className="text-muted mb-2">Date Created: <strong>{formatDate(data.metadata.date || data.timestamp)}</strong></p>
                <p className="text-muted mb-2">Company Id: <strong>{data.metadata.companyId}</strong></p>
                <Components.actionsButton
                  containerClassNames={'action-button-container pb-1'}
                  id={'withdrawal-actions'}
                  actionContent={actionButtonOptions}
                  buttonClassNames="btn btn-secondary"
                />
              </div>
              <p className="text-muted mb-2">Job Name: <strong>{data.metadata.name}</strong></p>
            </div>
          );
        case 'wfsTransfers':
          return (
            <div className="card-body">
              <div className="flex">
                <p className="text-muted mb-2">Job Date: <strong>{formatTimestamp(data.timestamp)}</strong></p>
                <p className="text-muted mb-2">File Date: <strong>{data.metadata.dateCreated}</strong></p>
                <Components.actionsButton
                  containerClassNames={'action-button-container pb-1'}
                  id={'withdrawal-actions'}
                  actionContent={actionButtonOptions}
                  buttonClassNames="btn btn-secondary"
                />
              </div>
            </div>
          );
        case 'wfsTransactions':
          return (
            <div className="card-body">
              <div className="flex">
                <p className="text-muted mb-2">Date Created: <strong>{formatTimestamp(data.timestamp)}</strong></p>
                <p className="text-muted mb-2">Company Id: <strong>{data.metadata.companyId}</strong></p>
                <Components.actionsButton
                  containerClassNames={'action-button-container pb-1'}
                  id={'withdrawal-actions'}
                  actionContent={actionButtonOptions}
                  buttonClassNames="btn btn-secondary"
                />
              </div>
              <p className="text-muted mb-2">WEX File Name: <strong>{data.metadata.name}</strong></p>
            </div>
          );
        default:
          return (
            <div className="card-body">
              <div className="flex">
                <p className="text-muted mb-2">Report Range: <strong>{formatDateRange()}</strong></p>
                <Components.actionsButton
                  containerClassNames={'action-button-container pb-1'}
                  id={'withdrawal-actions'}
                  actionContent={actionButtonOptions}
                  buttonClassNames="btn btn-secondary"
                />
              </div>
              <p className="text-muted mb-2">Created By: <strong>{data.metadata.createdBy}</strong></p>
              <p className="text-muted mb-2">Template Id: <strong>{data.metadata.reportTemplateId}</strong></p>
            </div>
          );
      }
    }

    return (
      <div className="components_cards_joberror p-4">
        <div className="card card-with-label small-padding">
          <p className="card-label px-1"><strong>Overview</strong></p>
          <CardContent />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_cards_jobprocessed);


