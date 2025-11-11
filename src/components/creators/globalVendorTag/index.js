import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('globalVendors_*')(state),
    status: state.global.tags.status,
    tags: state.global.tags.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createGlobalVendorTag: (data) => {
      return dispatch(Store.global.createGlobalVendorTag(data));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      dispatch(Store.global.clearErrorsGlobalVendorTag());
    },
  });
};

class components_creators_globalVendorTag extends Component {

  state = {
    showCreatedNotification: false,
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onCreate = () => {
    this.setState({ showCreatedNotification: true });
    this.props.resetForm('Components.forms.globalVendorTag', 'default', {
      name: '',
      description: '',
      active: true,
      aliases: '',
    });
  };

  submit = () => {
    const data = _try(() => this.props.forms['Components.forms.globalVendorTag'].default._values);
    if (!data) return;
    data.aliases = data.aliases ? data.aliases.split(',') : [];
    this.props.createGlobalVendorTag(data);
    this.setState({ showCreatedNotification: false });
  };

  render() {
    const { status, forms } = this.props;
    const error = status.creatingError;
    const creating = status.creating;
    const form = _try(() => forms['Components.forms.globalVendorTag'].default) || {};
    const disabled = creating || form._allInitial || !form._allValid;

    return (
      <Components.creators.creatorwrapper
        className="components_creators_globalVendorTag"
        canCreate={this.props.policies.canCreate}
        status={this.props.status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
        createFormActive={!this.props.hideCreateForm}
      >
        <Fragment>
          <Components.forms.globalVendorTag
            blurAll={this.state.blurAll}
          />
          {error &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          }
          {this.state.showCreatedNotification &&
            <div className="alert alert-primary" role="alert">
              Tag successfully created! You can edit tags below, or create another.
            </div>
          }
          <Components.button
            className="btn btn-primary"
            buttonText="Create"
            onClick={this.submit}
            ariaLabel="Create Tag"
            updating={creating}
            disabled={disabled}
            onDisabledClick={() => { this.setState({ blurAll: true }); }}
          />
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_globalVendorTag);


