import { connect, Component } from 'component';

import Store from 'store';
import Components from 'components';

const STATUSES = {
  paused: 'Paused',
  queued: 'Queued',
  running: 'Running',
  failed: 'Failed',
  success: 'Success',
  submitted: 'Submitted',
  retired: 'Retired',
};

const mapStateToProps = (state, props) => (
  {
    forms: state.forms,
    organizations: state.organizations.data.items,
  }
);

const mapDispatchToProps = { ...Store.forms };

class components_forms_botsFilter extends Component {

  state = {
    name: 'Components.forms.botsFilter',
  };

  componentDidMount() {
    const { initialize } = this.props;
    const initialFormData = this.props.initialFormData || {};
    const formKey = this.props.formKey || 'default';
    initialize(this.state.name, formKey, {
      status: initialFormData.status || 'paused',
      organizationId: initialFormData.organizationId || '',
    });

    this.setState({ key: formKey });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }

    this.setState((prevState) => ({
      ...prevState,
      form: nextProps.forms[prevState.name] && nextProps.forms[prevState.name][nextProps.formKey || 'default'],
      key: nextProps.formKey || 'default',
    }));
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  render() {
    const { form } = this.state;
    const {
      initializing,
      replacing,
      initializingKeys,
      onSubmit,
      organizations,
      updating,
    } = this.props;

    const organizationsFilteredAndSorted = Object.values(organizations).sort((a, b) => (a.name > b.name ? 1 : -1)).filter((org) => org.active).reduce((acc, organization) => {
      const org = {
        id: organization._id,
        name: organization.name,
      };

      acc.push(org);
      return acc;
    }, []);

    if (!form) {
      return null;
    }

    return (
      <form className="floating-labels" onSubmit={onSubmit}>
        <h4 className="mb-2 mt-4">Select a bot status</h4>
        <div className="d-flex flex-column align-items-start mt-2 mb-2">
          <select
            id="status"
            name="status"
            className="form-control w-100 h-100 overlayedSelect"
            value={form._values.status}
            onChange={(e) => {
              this.standardFormAction('change', 'status', e.target.value);
            }}
          >
            {Object.keys(STATUSES).map((status) => <option value={status}>{STATUSES[status]}</option>)}
          </select>
          <h4 className="mb-2 mt-4">Select an organization</h4>
          <select
            className="form-control w-100 h-100 overlayedSelect"
            value={form._values.organizationId}
            label="Organization"
            onChange={(e) => {
              this.standardFormAction('change', 'organizationId', e.target.value);
            }}
          >
            <option value="">All</option>
            {organizationsFilteredAndSorted.map((org) => <option value={org.id}>{org.name}</option>)}
          </select>
          {/* Conditionally render invisible input so enter keypress can trigger onSubmit function prop */ }
          {onSubmit && <input type="submit" style={{ visibility: 'hidden' }} />}
          <Components.button
            buttonText="Search"
            onClick={() => onSubmit()}
            ariaLabel="Search"
            updating={updating}
            onDisabledClick={() => this.setState({ blurAll: true })}
            disabled={initializing || replacing || initializingKeys}
          />
        </div>
      </form>
    );
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(components_forms_botsFilter);
