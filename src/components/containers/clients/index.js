import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    clientStatus: state.account.clients.status,
    clientPolicies: Selectors.entity('clients_idOrganization_idAccount')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openUploadClientsModal: () => {
      dispatch(Store.router.openModal('Components.modals.uploadClients'));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_containers_clients extends Component {




  render() {
    const { clientStatus, clientPolicies } = this.props;
    if (!clientStatus.fetched) return <Components.spinner />;
    return (
      <div className="components_containers_clients">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="card-title mb-3">Clients</h2>
          {clientPolicies.canCreate &&
            <Components.button
              buttonText="Add Clients"
              onClick={this.props.openUploadClientsModal}
              className="btn btn-primary"
              ariaLabel="Add Clients"
              updating={clientStatus.creating}
              icon="mdi mdi-plus-circle text-white"
              iconLeft
            />
          }
        </div>
        <Components.tables.clients />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_containers_clients);


