import { connect, Component, bindActionCreators, Fragment } from 'component';

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_notificationPreferenceCategory extends Component {

  state = {
    key: 'default',
    name: 'Components.forms.notificationPreferenceCategory',
  };

  componentDidMount() {
    const {
      initialize,
      initialData = {},
      events = {},
    } = this.props;

    const key = this.props.formKey || this.state.key;
    this.setState({ key, name: 'Components.forms.notificationPreferenceCategory' });

    const data = { ...initialData };
    Object.keys(events).forEach((eventCategory) => {
      events[eventCategory].forEach(({ id }) => {
        if (!data[id]) data[id] = { sms: false, email: false };
      });
    });

    this.setState({ eventItems: data });

    initialize('Components.forms.notificationPreferenceCategory', key, data);
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }
  standardFormAction = (action, field, value, label) => {
    const fields = _try(() => this.props.forms[this.state.name][this.state.key][field].value, {});
    const clone = Utils.cloneObject(fields);
    clone[label] = value;
    this.props.change(this.state.name, this.state.key, { [field]: clone });
  };

  _getCurrentStatus = (fieldId) => {
    const { _values } = _try(() => this.props.forms[this.state.name][this.state.key], { _values: {} });

    let result = '';
    if (!_values[fieldId]) {
      result = '';
    } else if (_values[fieldId].email && _values[fieldId].sms) {
      result = 'This notification will be sent to all your registered devices.';
    } else if (_values[fieldId].email) {
      result = 'You will receive this notification by email.';
    } else if (_values[fieldId].sms) {
      result = 'You will receive this notification by sms.';
    } else {
      result = 'You are not subscribed to this notification.';
    }
    return result;
  }

  render() {
    const borderStyle = { paddingTop: '1rem', borderTop: 'solid 1px rgb(220, 220, 220)', marginLeft: '1.45rem', marginRight: '1.45rem' };
    const form = _try(() => this.props.forms[this.state.name][this.state.key], null);
    if (!form) return null;

    return (
      <div
        className="components_forms_notificationPreferenceCategory"

      >
        {Object.keys(this.props.events).map(eventType => (
          <Components.boxaccordion
            label={eventType}
            leftAligned
            selected
          >
            {this.props.events[eventType].map(({ id, name, description }, i) => {
              const currentSubscriptionStatus = this._getCurrentStatus(id);
              return (
                <div style={i > 0 ? borderStyle : { marginLeft: '1.45rem', marginRight: '1.45rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>{name}</h3>
                    <Components.notificationdeliverytooltip
                      tooltipDisplay={description}
                    />
                  </div>
                  <div className="row">
                    <div className="col-xs-12 col-md-3">
                      <Components.forms.components.switch
                        form={form}
                        field={`${id}`}
                        action={this.standardFormAction}
                        label="email"
                        useIconLabel
                        icon="mdi-email-outline"
                      />
                    </div>
                    <div className="col-xs-12 col-md-3">
                      <Components.forms.components.switch
                        form={form}
                        field={`${id}`}
                        action={this.standardFormAction}
                        label="sms"
                        useIconLabel
                        icon="mdi-phone"
                      />
                    </div>
                  </div>
                  <div style={{ paddingBottom: '10px', marginTop: '-40px' }}>
                    <span>{currentSubscriptionStatus}</span>
                  </div>
                </div>
              );
            })}
          </Components.boxaccordion>
        ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_notificationPreferenceCategory);


