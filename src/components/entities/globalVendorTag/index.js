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
    updateGlobalVendorTag: (id, data) => {
      return dispatch(Store.global.updateGlobalVendorTag(id, data));
    },
    clearStatusErrors: () => {
      dispatch(Store.global.clearErrorsGlobalVendorTag());
    },
  });
};

class components_entities_globalVendorTag extends Component {

  state = {
    editBtnText: 'Edit',
  };




  onSubmit = () => {
    const { id } = this.props;
    const data = _try(() => this.props.forms['Components.forms.globalVendorTag'][id]._values);
    if (!data) return;
    data.aliases = data.aliases ? data.aliases.split(',') : [];
    this.props.updateGlobalVendorTag(id, data);
  };

  onCancel = () => {
    this.setState({
      blurAll: false,
    });
  };

  render() {
    const { policies, status, tags, id } = this.props;
    const form = _try(() => this.props.forms['Components.forms.globalVendorTag'][id]) || {};
    const error = status.updatingError;
    const updating = status.updating;
    const updateDisabled = updating || !form._allValid || form._allInitial;

    const tag = tags[id] || {};

    return (
      <div className="p-3 pt-4 components_entities_globalVendorTag">
        <Components.entities.entitywrapper
          canRead={policies.canRead}
          canUpdate={policies.canUpdate}
          canDelete={policies.canDelete}
          onSubmit={this.onSubmit}
          onCancel={this.onCancel}
          clearStatusErrors={this.props.clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={this.state.editBtnText}
          onDisabledClick={() => { this.setState({ blurAll: true }); }}
        >
          <Components.overviews.globalVendorTag
            id={id}
          />
          <Components.forms.globalVendorTag
            initialData={tag}
            formKey={id}
            blurAll={this.state.blurAll}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_globalVendorTag);


