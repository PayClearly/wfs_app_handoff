import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import classNames from 'classnames';


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tab extends Component {




  render() {
    const { children, name, isActive, tabClassName, isPersisted } = this.props;
    const tabClassNames = classNames('tab-pane', { activeTab: isActive }, tabClassName);

    if (!isActive && !isPersisted) return null;

    return (
      <div className={classNames('components_tab', isPersisted && 'persistedTab', isActive && 'activeTab')}>
        <div className={tabClassNames} id={name} role="tabpanel" aria-expanded={isActive}>
          <div className="card-body">
            {children}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tab);


