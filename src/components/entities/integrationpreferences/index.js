import { connect, Component } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state, props) => ({
  policies: Selectors.entity(`${props.type}_idOrganization_idAccount`)(state),
  integration: Selectors.integrations(state)[props.type] || {},
  form: _try(() => state.forms['Components.forms.integrationpreferences'][props.type]),
});

const mapDispatchToProps = (dispatch, props) => ({
  update: (data) => {
    dispatch(Store.account.updateIntegrationPreferences(props.type, data));
  },
});

// eslint-disable-next-line camelcase
class components_entities_integrationpreferences extends Component {
  onSubmit() {
    this.props.update(this.props.form._values);
  }

  render() {
    const loading = _try(() => this.props.integration.linked && this.props.integration.status.fetched);

    if (!loading) { return null; }
    const { canRead, canUpdate, canDelete } = this.props.policies;
    const { status } = this.props.integration;

    const error = status.updatingError;
    const { updating } = status;
    const updateDisabled = _try(() => updating || !this.props.form._allValid || this.props.form._allInitial);

    const { preferences, possiblePreferences, data } = this.props.integration;

    return (
      <div className="components_entities_integrationpreferences">
        <Components.entities.entitywrapper
          canRead={canRead}
          canUpdate={canUpdate && !!Object.keys(preferences || {}).length}
          canDelete={canDelete}
          onSubmit={() => this.onSubmit()}
          clearStatusErrors={this.props.clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={'Edit'}
          wrapperClasses={'mt-3'}
          orgId={this.props.orgId}
          accountId={this.props.accountId}
        >
          {(() => Object.keys(preferences || {})
            .map((key) => {
              if (!possiblePreferences || !possiblePreferences[key]) { return <div />; }
              const title = possiblePreferences[key].description;
              const val = _try(() => data
                .resources[possiblePreferences[key].refItem][preferences[key]][possiblePreferences[key].refDisplay])
                || preferences[key]
                || possiblePreferences[key].default;
              const required = possiblePreferences[key].required && preferences[key] === null;

              return (
                <p> - {title}:
                  <strong>{val}{(!val && required && <span className="badge rounded-pill bg-danger">required</span>)
                    || ''}
                  </strong>
                </p>
              );
            }))()}
          <Components.forms.integrationpreferences
            initialData={preferences}
            integration={this.props.integration}
            formKey={this.props.type}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_integrationpreferences);
