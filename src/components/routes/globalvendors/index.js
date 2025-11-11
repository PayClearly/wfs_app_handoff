import {
  connect, Component, Fragment,
} from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  tab: state.router.route.params.tab,
  policies: Selectors.entity('globalVendors_*')(state),
  globalDataFetched: Selectors.csrGlobalItemsFetched(state),
  uploadVendorsFeatureFlag: Selectors.featureFlags(state).bulkVendorUploads,
});

const mapDispatchToProps = (dispatch) => ({
  setTabInRoute: (tab) => dispatch(Store.router.setQueryParams({ tab })),
  openVendorUploadModal: () => {
    dispatch(Store.router.openModal('Components.modals.uploadvendors', {}));
  },
});

class componentsRoutesGlobalvendors extends Component {

  state = {
    hideCreateForm: true,
  };

  tabSelected = (tab) => {
    this.props.setTabInRoute(tab);
    this.setState({ hideCreateForm: true });
  };

  render() {
    if (!this.props.policies.canRead) { return <Components.invalidpermissions />; }

    return (
      <div className="components_routes_globalvendors">
        <Components.tabs defaultTab={this.props.tab} setTabInRoute={this.tabSelected}>
          <Components.tab name="globalVendors" label="Vendors" iconClassName="mdi-home">
            {
              !this.props.globalDataFetched
                ? <Components.spinner />
                : (
                  <Fragment>
                    <div className="d-flex justify-content-left">
                      <h3 className="text-muted mb-2 mb-md-0 me-2">Global Vendors</h3>
                      <Components.button
                        buttonText={this.state.hideCreateForm ? 'Create A Vendor' : 'Hide Create Form'}
                        onClick={() => this.setState((prevState) => ({ hideCreateForm: !prevState.hideCreateForm }))}
                      />
                      {this.props.uploadVendorsFeatureFlag && (
                        <Components.button
                          buttonText="Upload Vendors"
                          onClick={() => this.props.openVendorUploadModal()}
                          style={{ marginLeft: '4px' }}
                        />
                      )}
                    </div>
                    <Components.creators.globalVendor hideCreateForm={this.state.hideCreateForm} />
                    {!this.state.hideCreateForm && <hr />}
                    <Components.tables.globalVendors
                      title={'View Global Vendors'}
                    />
                  </Fragment>
                )
            }
          </Components.tab>
          <Components.tab name="groups" label="Groups" iconClassName="mdi-home-group">
            <Components.globalTabTitleWrapper
              onClick={() => this.setState((prevState) => ({ hideCreateForm: !prevState.hideCreateForm }))}
              title="Groups"
              hideCreateForm={this.state.hideCreateForm}
            />
            <Components.creators.globalVendorGroup hideCreateForm={this.state.hideCreateForm} />
            {!this.state.hideCreateForm && <hr />}
            <Components.tables.globalVendorGroups />
          </Components.tab>
          <Components.tab name="tags" label="Tags" iconClassName="mdi-tag">
            <Components.globalTabTitleWrapper
              onClick={() => this.setState((prevState) => ({ hideCreateForm: !prevState.hideCreateForm }))}
              title="Tags"
              hideCreateForm={this.state.hideCreateForm}
            />
            <Components.creators.globalVendorTag hideCreateForm={this.state.hideCreateForm} />
            {!this.state.hideCreateForm && <hr />}
            <Components.tables.globalVendorTags
              title={'View Tags'}
            />
          </Components.tab>
          <Components.tab name="creds" label="Creds" iconClassName="mdi-lock">
            <Components.globalTabTitleWrapper
              onClick={() => this.setState((prevState) => ({ hideCreateForm: !prevState.hideCreateForm }))}
              title="Creds"
              hideCreateForm={this.state.hideCreateForm}
            />
            <Components.creators.globalCredentialSchema
              hideCreateForm={this.state.hideCreateForm}
            />
            {!this.state.hideCreateForm && <hr />}
            <Components.tables.globalCredentialSchemas />
          </Components.tab>
          <Components.tab name="fields" label="Fields" iconClassName="mdi-text">
            <Components.globalTabTitleWrapper
              onClick={() => this.setState((prevState) => ({ hideCreateForm: !prevState.hideCreateForm }))}
              title="Fields"
              hideCreateForm={this.state.hideCreateForm}
            />
            <Components.creators.globalVendorSchema
              title={'Create'}
              hideCreateForm={this.state.hideCreateForm}
            />
            {!this.state.hideCreateForm && <hr />}
            <Components.tables.globalVendorSchemas />
          </Components.tab>
        </Components.tabs>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsRoutesGlobalvendors);

