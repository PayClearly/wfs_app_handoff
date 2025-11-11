import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

// Third Party Imports ...
import classNames from 'classnames';

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  featureFlags: Selectors.featureFlags(state),
});

const mapDispatchToProps = (dispatch, props) => ({});

class components_tabs extends Component {

  state = {
    tabs: [],
    currentTab: '',
  };

  componentDidMount() {
    const items = (this.props.children.length && this.props.children) || [this.props.children] || [];
    const currentTab = (items.some((item) => item.props.name === this.props.defaultTab) && this.props.defaultTab) || (items.length && items[0].props.name);

    this.setState({
      currentTab,
    });
  }

  componentWillReceiveProps(nextProps) {
    const items = (nextProps.children.length && nextProps.children) || [nextProps.children] || [];
    if (this.props.defaultTab !== nextProps.defaultTab) {
      this.setState({
        currentTab: (items.some((item) => item.props.name === nextProps.defaultTab) && nextProps.defaultTab) || (items.length && items[0].props.name),
      });
    }
  }



  _handleTabClick = (e) => {
    e.preventDefault();
    const hash = e.target.hash || e.target.parentNode.hash;
    const tabName = hash.replace('#', '');
    this.setState({
      currentTab: tabName,
    });
    // window._analytics.mixpanel.time_event('Page View');
    if (this.props.onTabSelect) { this.props.onTabSelect(tabName); }
    return this.props.setTabInRoute && this.props.setTabInRoute(tabName);
  };

  _tabMenu = (tab) => {
    const {
      name, label, iconClassName, badges, tabNavItemClassName, navItemComponents,
    } = tab.props;
    const active = name === this.state.currentTab;
    const tabClassNames = classNames('nav-link', { active }, { badges }, tabNavItemClassName);
    const iconClassNames = classNames('mdi', iconClassName);
    return (
      <li className="nav-item">
        <a className={tabClassNames} data-toggle="tab" href={`#${name}`} title={label} onClick={this._handleTabClick} role="tab" aria-expanded={active}>
          <i className={iconClassNames} />
          <span className="ms-2 label">{label}</span>
          {badges && Object.values(badges).some((badge) => badge.active) && <Components.badges.alert badges={badges} position="tabs" />}
          {navItemComponents && navItemComponents.map((navItemComponent) => navItemComponent)}
        </a>
      </li>
    );
  };

  render() {
    const tabs = ((this.props.children.length && this.props.children) || [this.props.children]).filter((tab) => {
      if (_resolve(tab, 'props.hide')) { return false; }
      if (_resolve(tab, 'props.featureFlag') && !this.props.featureFlags[tab.props.featureFlag]) { return false; }
      return true;
    });

    return (
      <div className="components_tabs">
        <div className={`${this.props.noCard ? '' : 'card'}`}>
          <ul className="nav nav-tabs link-style-tab" role="tablist">
            {tabs && tabs.length && tabs.map((tab) => this._tabMenu(tab))}
          </ul>
          <div className="tab-content pb-1">
            {tabs && tabs.map((tab) => (<Components.tab {...tab.props} isActive={tab.props.name === this.state.currentTab} />))}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tabs);


