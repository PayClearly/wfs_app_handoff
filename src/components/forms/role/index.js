import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    organization: state.organization,
    account: state.account,
    roleDefinitions: state.admin.roleDefinitions.data.item,
    privileges: Selectors.privileges(state),
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_role extends Component {

  state = {
    name: this.props.formName,
  };

  componentDidMount() {
    const { initialize, validate, initialFormData, id } = this.props;
    initialize(this.state.name, this.props.id, {
      role: initialFormData || 'none',
    });
    validate(this.state.name, id, this.validate);
  }
  componentWillReceiveProps(nextProps = {}) {
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.id],
      key: nextProps.id,
      roleOptions: nextProps.privileges.roleOptions,
    });
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.props.formName, this.state.key, field, value);
      this.props.validate(this.props.formName, this.state.key, this.validate);
    } else {
      this.props[action](this.props.formName, this.state.key, field);
    }
  };

  validate = () => {
    return {};
  };

  render() {
    const form = this.state.form;
    const { roleLevel, updating } = this.props;
    if (!form) return null;

    return (
      <form className="form material floating-labels">
        <div className="row">
          <div className="col-sm">
            <Components.forms.components.selectinput
              form={form}
              field="role"
              action={this.standardFormAction}
              label={`${roleLevel} role`}
              options={this.state.roleOptions[roleLevel]}
              placeholder={(this.state.roleOptions[roleLevel][form._values.role] && this.state.roleOptions[roleLevel][form._values.role].display) || 'none'}
              disabled={updating}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_role);

