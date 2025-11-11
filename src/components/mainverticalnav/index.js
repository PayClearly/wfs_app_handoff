import {
  connect, Component,
} from 'component';

// Third Party Imports ...
import classNames from 'classnames';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  route: state.router.route,
  privileges: Selectors.privileges(state),
  allPolicies: state.user.policies.data.item,
  globalPaymentStatusesDenorm: Selectors.csrdashboard(state),
  organizationId: state.organization.data.id,
  accountId: state.account.data.id,
  invoices: state.account.invoices.data.items,
  featureFlags: Selectors.featureFlags(state),
  appConfig: state.appConfig.data,
  providerTheme: Selectors.providerTheme(state),
});

const mapDispatchToProps = (dispatch) => ({
  navigate: (name, params = {}) => {
    // window._analytics.mixpanel.time_event('Page View');

    // Temporary tracking logic to test loadtime for payments/create/uploadPayments
    if (name === 'create') {
      window._analytics.mixpanel.time_event('UploadPayments Loaded');
    }

    dispatch(Store.router.navigateTo(name, params));
  },
});

class components_mainverticalnav extends Component {

  state = {};





  menuItemClicked = (e, name, params) => {
    e.preventDefault();
    this.props.navigating();
    this.props.navigate(name, params);
    this.setState({
      selectedCategory: false,
    });
  };

  categoryClicked = (e, id) => {
    e.preventDefault();
    this.setState({
      selectedCategory: this.state.selectedCategory !== id && id,
    });
  };

  routeItem = (routeRoute, appRouterConfig, curRoute) => {
    const { organizationId, accountId, globalPaymentStatusesDenorm = {} } = this.props;

    if (routeRoute.onlyShowWithPrivileges
      && !routeRoute.onlyShowWithPrivileges.some((key) => this.props.privileges[key])) {
      return null;
    }

    if (routeRoute.onlyShowWithSpecificPolicies
      && !routeRoute.onlyShowWithSpecificPolicies.some((policy) => Utils.hasPolicy(
        this.props.allPolicies,
        policy,
        organizationId,
        accountId
      ))) {
      return null;
    }
    if (this.props.featureFlags[routeRoute.name] === false) { return null; }
    if (this.props.featureFlags[routeRoute.featureFlag] === false) { return null; }

    const isCurrentRoute = curRoute.name === routeRoute.name;
    const liClassNames = classNames({ active: isCurrentRoute });

    let alertBadges;
    if (routeRoute.name === 'ftpPayments') {
      alertBadges = {
        needAttention: {
          active: globalPaymentStatusesDenorm.pendingFTPPayments,
          holds: globalPaymentStatusesDenorm.heldFTPPayments,
          color: 'danger',
        },
      };
    }

    return (<li className={liClassNames}>
      <a
        style={{ fontWeight: (isCurrentRoute && 700) || 200, display: 'grid', gridTemplateColumns: '0fr 10fr 3fr' }}
        href={`/${routeRoute.name}`}
        onClick={(e) => this.menuItemClicked(e, routeRoute.name)}
      >
        <i className={routeRoute.icon} /> {routeRoute.displayName}
        <span>
          {alertBadges && Object.values(alertBadges).some((badge) => badge.active)
            && <i className="mdi mdi-alert-circle-outline text-danger" />}
          {alertBadges && Object.values(alertBadges).some((badge) => badge.holds)
            && <i className="mdi mdi-alert-circle-outline text-success" />}
        </span>
      </a>
    </li>);
  };

  categoryItem = (routeCategory, appRouterConfig, curRoute) => {
    const { globalPaymentStatusesDenorm = {} } = this.props;

    if (routeCategory.onlyShowWithPrivileges
      && !routeCategory.onlyShowWithPrivileges.some((key) => this.props.privileges[key])) {
      return null;
    }
    if (this.props.featureFlags[routeCategory.id] === false) { return null; }

    let isActive = false;
    const subroutes = [];
    const routes = Object.keys(appRouterConfig.routes)
      .filter((key) => appRouterConfig.routes[key].category === routeCategory.id).map((key) => {
        isActive = isActive || curRoute.name === appRouterConfig.routes[key].name;
        subroutes.push(appRouterConfig.routes[key].name);
        return this.routeItem(appRouterConfig.routes[key], appRouterConfig, curRoute);
      });

    const isParentOfCurrentRoute = subroutes.includes(curRoute.name);
    const isExpanded = (isActive || this.state.selectedCategory === routeCategory.id);
    const subnavheight = ((isExpanded && 80 * routes.length) || 0);

    if (routes.every((value) => value === null)) { return null; }

    let badges = null;

    if (routeCategory.id === 'support' && this.props.allPolicies['globalVendors_*_read']) {
      const paymentStatusesBadges = {
        needAttention: {
          active: Boolean(globalPaymentStatusesDenorm.itemsNeedAttention),
          value: globalPaymentStatusesDenorm.itemsNeedAttention,
          color: 'danger',
        },
        otherPending: {
          active: Boolean(globalPaymentStatusesDenorm.otherPendingPayments),
          value: globalPaymentStatusesDenorm.otherPendingPayments,
          color: 'primary',
        },
        awaitingAuthorization: {
          active: Boolean(globalPaymentStatusesDenorm.itemsForWarning),
          value: globalPaymentStatusesDenorm.itemsForWarning,
          position: 3,
          color: 'warning',
        },
      };

      badges = { ...paymentStatusesBadges };
    }

    if (routeCategory.id === 'invoices') {
      const invoices = Object.values(this.props.invoices);
      const needsAttention = invoices.filter((invoice) => invoice.status === 'created' || invoice.status === 'pendingReview').length;
      const readyToPay = invoices.filter((invoice) => invoice.status === 'ready').length;
      badges = {
        needAttention: {
          active: !!needsAttention,
          value: needsAttention,
          color: 'warning',
        },
        awaitingAuthorization: {
          active: !!readyToPay,
          value: readyToPay,
          color: 'success',
        },
      };
    }

    const liClassNames = classNames({ active: isExpanded, 'fw-bold': isParentOfCurrentRoute });
    const aClassNames = classNames('has-arrow', { badges });

    return (
      <li className={liClassNames}>
        <a
          aria-expanded={isExpanded}
          role="button"
          tabIndex="0"
          onClick={(e) => { this.categoryClicked(e, routeCategory.id); }}
          className={aClassNames}
        >
          <i className={routeCategory.icon} /><span className="hide-menu">{routeCategory.name}</span>
          {badges
            && Object.values(badges).some((badge) => badge.active)
            && <Components.badges.alert badges={badges} position="main-vertical-nav-category" />}
        </a>
        <ul
          style={{ maxHeight: subnavheight }}
          className="subnavitems"
        // aria-expanded={isExpanded}
        >
          {routes}
        </ul>
      </li>
    );
  };

  groupItem = (routeGroup, appRouterConfig, curRoute) => {
    const categories = Object.keys(appRouterConfig.categories)
      .filter((key) => appRouterConfig.categories[key].group === routeGroup.id).map((key) => this.categoryItem(
        appRouterConfig.categories[key],
        appRouterConfig,
        curRoute
      ));

    if (categories.every((value) => value === null)) { return null; }

    return (
      <ul>
        {routeGroup.name && <li className="nav-small-cap text-uppercase">{routeGroup.name}</li>}
        {categories}
      </ul>
    );
  };

  render() {
    const routerConfig = _try(() => this.props.appConfig.router);
    const routeName = this.props.route && this.props.route.name.split('_')[0];
    const groups = Object.keys(routerConfig.groups).map((key) => this.groupItem(
      routerConfig.groups[key],
      routerConfig,
      this.props.route,
      routeName
    ));
    const currentYear = (new Date()).getFullYear();
    return (
      <aside className="left-sidebar components_mainverticalnav main-layout-leftnav">
        <div className="scroll-sidebar">
          <nav className="sidebar-nav">
            <Components.organizationcontext />
            {groups}
          </nav>
        </div>
        {!this.props.providerTheme.disableCopyright
          && <footer className="text-center">
            <p className="my-2">© {currentYear} PayClearly</p>
          </footer>}
      </aside>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_mainverticalnav);


