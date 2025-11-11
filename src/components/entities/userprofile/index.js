import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import objectResolvePath from 'object-resolve-path';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    access: state.user.access,
    forms: state.forms,
    profile: state.user.profile,
    orgId: state.organization.data.id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateProfile: (data) => {
      return dispatch(Store.user.updateProfile(data));
    },
    updateAvatar: (avatar) => {
      return dispatch(Store.user.updateProfile({ avatar }));
    },
    clearStatusErrors: () => {
      dispatch(Store.user.clearProfileErrors());
    },
  });
};

class components_entities_userprofile extends Component {

  state = {
    formName: 'Components.forms.editprofile',
    formKey: 'default',
    editBtnText: 'Edit Profile',
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onSubmit = () => {
    const form = this.props.forms[this.state.formName][this.state.formKey];
    const data = form._values;

    this.props.updateProfile(data);
  }

  onCancel = () => {
    this.setState({ blurAll: false });
  }

  render() {
    if (!this.props.profile) return <Components.loading />;

    const profileStatus = this.props.profile.status;

    const error = profileStatus.updatingError;
    const updating = profileStatus.updating;
    const form = (this.props.forms[this.state.formName] && this.props.forms[this.state.formName][this.state.formKey]) || {};
    const updateDisabled = updating || !form._allValid || form._allInitial;

    const profilePhoto = objectResolvePath(this.props.profile, 'data.item.avatar');

    return (
      <Components.entities.entitywrapper
        className="components_entities_userprofile"
        canRead
        canUpdate
        onSubmit={this.onSubmit}
        updating={updating}
        error={error}
        updateDisabled={updateDisabled}
        editBtnText={this.state.editBtnText}
        orgId={this.props.orgId}
        onDisabledClick={() => { this.setState({ blurAll: true }); }}
        onCancel={this.onCancel}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        {
          !this.props.noProfile &&
          <Fragment>
            <div className="row">
              <div className="col-md-12">
                <Components.photouploader
                  onSavePhoto={(img) => { this.props.updateAvatar(img); }}
                  outputWidth={120}
                  outputHeight={120}
                  src={profilePhoto}
                  iconClassName="mdi-account"
                  uid={this.props.access.data.uid}
                />
              </div>
            </div>
            <Components.userdetails profile={this.props.profile} className="row mt-3" />
          </Fragment>
        }
        <div className="row mt-3">
          <div className="col-md-12">
            <Components.forms.editprofile
              profile={this.props.profile}
              updating={updating}
              blurAll={this.state.blurAll}
            />
          </div>
        </div>
      </Components.entities.entitywrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_userprofile);


