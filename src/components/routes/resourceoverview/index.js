import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const context = require.context('../../overviews', true, /\.js$/);
const overviews = Utils.importNestedDirectory(context);

const mapStateToProps = (state, props) => {
  const router = state.router;
  const resourceName = router.route.params.resource;
  const resourceId = router.route.params.id;
  const storeItems = router.resourceNameToOverview[resourceName] || false;
  const storePath = storeItems ? _resolve(state, storeItems.storePath) : null;
  const storePathString = storeItems ? router.resourceNameToOverview[resourceName].storePath : null;
  const componentNames = router.resourceNameToOverview[resourceName].component || null;
  const componentTitles = router.resourceNameToOverview[resourceName].componentTitles || null;

  return ({
    adminAccounts: state.admin.accounts.data.item,
    resourceId,
    storePath,
    storePathString,
    componentNames,
    componentTitles,
    organizationId: router.route.params.orgId,
    accountId: router.route.params.accountId,
    router,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    removeQueryParams: (params = []) => {
      dispatch(Store.router.removeQueryParams(params));
    },
    getResource: (storePath, id, org, account) => {
      if (!storePath) return null;
      const pathKeys = storePath.split('.');
      dispatch(Store.account.fetchResource(id, pathKeys[1], org, account));
    },
  });
};

class components_routes_resourceoverview extends Component {


  componentWillReceiveProps(nextProps) {
    if (this.props.organizationId && this.props.accountId && this.props.router) {
      const currentContext = { organizationId: this.props.organizationId, accountId: this.props.accountId };
      const nextContext = { organizationId: nextProps.organizationId, accountId: nextProps.accountId };
      if (!Utils.contextMatch(currentContext, nextContext)) this.removeQueryParams();

    }
  }
  componentWillUnmount() {
    this.removeQueryParams();
  }

  removeQueryParams() {
    this.props.removeQueryParams(Object.keys(this.props.router.route.params).filter(param => param === 'orgId' || param === 'accountId'));
  }

  render() {
    const { resourceId, storePath, storePathString, componentNames, componentTitles } = this.props;

    if (!storePath || !componentNames || !componentNames.every(name => overviews[name])) return <Components.routes.error404 />;

    if (!Object.keys(this.props.adminAccounts).length || !storePath.status.fetched) {
      if (resourceId && !storePath.data.items[resourceId] && storePath.status && !storePath.status.fetching) this.props.getResource(storePathString, resourceId, this.props.organizationId, this.props.accountId);
      return <Components.spinner />;
    }
    if (!storePath.data.items[resourceId]) return <Components.routes.error404 resourceNotFound />;
    return (
      <div className="py-2">
        {componentNames.map((val, index) => {
          const Comp = overviews[val];
          return (
            <div className={`card${index + 1 !== componentNames.length ? ' mb-2' : ''}`}>
              <h4 className="card-title mt-3 ms-3">{componentTitles[index]}</h4>
              <div className="px-3">
                <Comp id={resourceId} />
              </div>
            </div>
          );
        })
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_resourceoverview);


