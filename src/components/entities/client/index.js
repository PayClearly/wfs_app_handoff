import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    client: _try(() => state.account.clients.data.items[props.id], {}),
    status: state.account.clients.status,
    policies: Selectors.entity('clients_idOrganization_idAccount')(state),
    form: _try(() => state.forms['Components.forms.client'][props.id], {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateClient: (id, data) => {
      return dispatch(Store.account.updateClient(id, data));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsClients());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_entities_client extends Component {
  state = {
    formName: 'Components.forms.client',
    editBtnText: 'Edit Client',
  }




  onSubmit = () => {
    const { client, form } = this.props;
    const data = { ...(_try(() => form._values) || {}) };
    this.props.updateClient(client._id, data);
  }

  onCancel = () => {
    this.setState({ blurAll: false });
  }

  render() {
    const { id, client, status, policies, clearStatusErrors, form = {} } = this.props;

    const error = status.updatingError;
    const updating = status.updating;
    const updateDisabled = updating || !form._allValid || form._allInitial;

    return (
      <div className="components_entities_client p-3">
        <Components.entities.entitywrapper
          canRead={policies.canRead}
          canUpdate={policies.canUpdate}
          canDelete={policies.canDelete}
          onSubmit={this.onSubmit}
          onCancel={this.onCancel}
          clearStatusErrors={clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={this.state.editBtnText}
          updateButtonText="Update Client"
          onDisabledClick={() => { this.setState({ blurAll: true }); }}
        >
          <Components.overviews.client id={id} />
          <Components.forms.client
            formKey={id}
            blurAll={this.state.blurAll}
            initialData={client}
            forUpdate
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_entities_client);


