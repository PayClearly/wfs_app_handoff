import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    notificationPreferences: state.account.notificationPreferences,
    status: state.account.notificationPreferences.status,
    orgId: state.organization.data.id,
    accountId: state.account.data.id,
    forms: state.forms,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    update: (data) => {
      dispatch(Store.account.updateNotificationPreference(data));
    },
  });
};

class components_entities_notificationPreferences extends Component {

  state = {
    selectedCategory: '',
  }




  onSubmit = () => {
    const form = this.props.forms['Components.forms.notificationPreferenceCategory'].default;
    this.props.update(form._values);
  }

  render() {
    const ClosedContent = props => props.events.map(event => (
      <Components.notificationPreferencePreview
        event={event}
        data={this.props.notificationPreferences.data.item[event.id]}
      />
    ));

    return (
      <div className="components_entities_notificationPreferences">
        <Components.entities.entitywrapper
          canRead
          canUpdate
          onSubmit={this.onSubmit}
          updating={this.props.status.updating}
          onEditClick={this.onEdit}
          editBtnText={'Edit Preferences'}
          orgId={this.props.orgId}
          accountId={this.props.accountId}
          onCancel={this.onCancel}
          clearStatusErrors={this.props.clearStatusErrors}
        >
          <Fragment>
            {Object.keys(this.props.events).map(eventType => (
              <Components.boxaccordion
                label={eventType}
                leftAligned
                onSelect={this.props.onSelect}
                closedContent={<ClosedContent events={this.props.events[eventType]} />}
              >
              </Components.boxaccordion>
            ))}
          </Fragment>
          <Components.forms.notificationPreferenceCategory
            initialData={this.props.notificationPreferences.data.item}
            events={this.props.events}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_notificationPreferences);


