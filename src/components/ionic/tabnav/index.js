import { connect, Component, bindActionCreators, Fragment } from 'component';
import {
  IonToolbar,
  IonFooter,
  IonGrid,
  IonCol,
  IonRow,
  IonIcon,
  IonLabel,
  IonRippleEffect,
  IonModal,
  IonButton,
} from '@ionic/react';
import { cardOutline, receipt, earth, person, documentText } from 'ionicons/icons';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    user: state.user,
    route: state.router.route,
    privileges: Selectors.privileges(state),
    allPolicies: state.user.policies.data.item,
    organizationId: state.organization.data.id,
    accountId: state.account.data.id,
    appConfig: _try(() => state.appConfig.data, {}),
    expenses: Selectors.expenses(state).expenses,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    navigate: (name, params = {}, routeOptions = {}) => {
      dispatch(Store.router.navigateTo(name, params, routeOptions));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_tabnav extends Component {
  state = {
    showPopover: false,
    event: undefined,
    iconsMap: {
      cardOutline, receipt, earth, documentText, person,
    },
  }
  componentDidMount() { }
  componentWillUnmount() { }

  tabButton = ({ id, icon, name }, routeName, index) => {
    const unassignedExpenses = this.props.expenses.filter(expense => !expense.deleted && !expense.reportId).length;
    return (
      <IonCol key={name}>
        <div
          className={`nav-button ion-activatable ion-justify-content-center ion-align-items-center${(id === routeName) ? ' current-tab' : ''}`}
          role="navigation"
          onClick={() => this.props.navigate(id)}
        >
          <IonRippleEffect />
          <div className="icon-parent">

            <IonIcon className="tab-nav-icon" icon={this.state.iconsMap[icon]} />

            {
              id === 'expenses' && unassignedExpenses > 0 &&
              <div className="notification-icon">{unassignedExpenses}</div>
            }
          </div>
          <IonLabel className="tab-nav-name">{name}</IonLabel>
        </div>
      </IonCol>
    );
  }

  render() {
    const routerConfig = _try(() => this.props.appConfig.router);
    const routeName = this.props.route && this.props.route.name.split('_')[0];

    const tabButtons = Object.values(routerConfig.categories).map((category, index) => {
      return this.tabButton(category, routeName, index);
    });

    return (
      <IonFooter className="components_ionic_tabnav">
        <IonToolbar>
          <IonGrid>
            <IonRow>
              {tabButtons}
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonFooter>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_tabnav);


