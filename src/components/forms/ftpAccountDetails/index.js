import {
  connect, Component, bindActionCreators,
} from 'component';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  forms: state.forms,
  ipWhitelist: state.account.ftpAccountDetails.data.item.ipWhitelist,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(Store.forms, dispatch),
  updateFtpAccount: (data) => dispatch(Store.account.updateFtpAccount(data)),
});

const mapResourcesToProps = () => ({});

class components_forms_ftpAccountDetails extends Component {

  state = {
    name: 'Components.forms.ftpAccountDetails',
  };

  componentDidMount() {
    const {
      initialize,
    } = this.props;
    const key = this.props.formKey || this.state.key;
    this.setState({ key });

    initialize(this.state.name, key, {
      oldPassword: '',
      newPassword: '',
      ipWhitelist: (this.props.ipWhitelist || this.props.initialData.fileMage.whitelist || []).join(', '),
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][this.state.key || 'default'],
      key: nextProps.formKey || 'default',
    });
  }



  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.props.id || 'default', field, value);
    } else {
      this.props[action](this.state.name, this.props.id || 'default', field);
    }
  };

  render() {
    const { form } = this.state;
    if (!form) {
      return null;
    }
    return (
      <div className="floating-labels components_forms_ftpAccountDetails">
        <div className="row">
          <div className="col-sm">
            <Components.forms.components.textinput
              form={form}
              type="password"
              field="oldPassword"
              action={this.standardFormAction}
              label="Old Password"
            />
          </div>
          <div className="col-sm">
            <Components.forms.components.textinput
              form={form}
              type="password"
              field="newPassword"
              action={this.standardFormAction}
              label="New Password"
              disabled={this.props.disabled}
            />
          </div>
          <div className="col-sm">
            <Components.forms.components.textinput
              form={form}
              type="ipWhitelist"
              field="ipWhitelist"
              action={this.standardFormAction}
              label="IP Addresses Whitelist, comma separated"
              disabled={this.props.disabled}
              enforce={/^[\.\,0-9 ]*$/}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_ftpAccountDetails);


