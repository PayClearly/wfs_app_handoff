import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    organizations: _try(() => state.organizations.data.items, {}),
    orgId: _try(() => state.organization.data.id),
    darkModeEnabled: state.appConfig.data.darkModeEnabled,

  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openUploadLogoModal: (data) => {
      return dispatch(Store.router.openModal('Components.modals.uploadlogo', { mode: data }));
    },
    uploadLogoToOrganization: (id, data) => {
      return dispatch(Store.organizations.update(id, data));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_organizationSettings extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  removeLogo = (mode) => {
    const { name, active } = _try(() => this.props.organizations[this.props.orgId], {});
    const field = mode === 'dark' ? 'darkLogo' : 'logo';
    const data = { name, active, [field]: [] };

    this.props.uploadLogoToOrganization(this.props.orgId, data);
  }

  render() {
    const { organizations, orgId } = this.props;
    const { logo, darkLogo } = _try(() => organizations[orgId], {});
    return (
      <div className="components_organizationSettings">
        <h3>Organization Logo</h3>
        {
          logo ?
            <Fragment>
              <p>This logo is being used to override the application&apos;s default logo</p>
              <div className="row">
                <div className="col-12 col-md-5">
                  <div className="card">
                    <Components.containers.image
                      alt={`attachment ${logo.originalname}`}
                      path={logo.storagePath}
                      hash={logo.md5Hash}
                      thumbnail={false}
                    />
                  </div>
                </div>
              </div>
              <button className="btn btn-primary mt-2" onClick={() => this.props.openUploadLogoModal()}>Change</button>
              <button className="btn btn-danger mt-2 ms-2" onClick={() => this.removeLogo()}>Remove</button>
            </Fragment>
            :
            <Fragment>
              <p>An organization logo can be uploaded to override the application&apos;s default logo</p>
              <button className="btn btn-primary mt-2" onClick={() => this.props.openUploadLogoModal()}>Upload</button>
            </Fragment>
        }
        {this.props.darkModeEnabled &&
          <Fragment>
            <h3>Organization Logo: Dark Mode</h3>
            {darkLogo ?
              <Fragment>
                <p>This logo is being used to override the application&apos;s default logo when the application is in Dark Mode</p>
                <div className="row">
                  <div className="col-12 col-md-5">
                    <div className="card">
                      <Components.containers.image
                        alt={`attachment ${darkLogo.originalname}`}
                        path={darkLogo.storagePath}
                        hash={darkLogo.md5Hash}
                        thumbnail={false}
                      />
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary mt-2" onClick={() => this.props.openUploadLogoModal('dark')}>Change</button>
                <button className="btn btn-danger mt-2 ms-2" onClick={() => this.removeLogo('dark')}>Remove</button>
              </Fragment>
              :
              <Fragment>
                <p>An organization logo can be uploaded to override the application&apos;s default logo when in Dark Mode</p>
                <button className="btn btn-primary mt-2" onClick={() => this.props.openUploadLogoModal('dark')}>Upload</button>
              </Fragment>}
          </Fragment>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_organizationSettings);


