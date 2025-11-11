import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonFooter, IonToolbar } from '@ionic/react';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_filters_components_footer extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const {
      reset,
      set,
    } = this.props;
    return (
      <IonFooter className="components_ionic_filters_components_footer ion-no-border">
        <IonToolbar className="lightBar">
          <div className={'buttonContainer ion-justify-content-between'}>
            <Components.ionic.button
              className="footerFitlersReset"
              buttonText="Reset"
              size="half"
              onClick={reset}
              style={{ '--color-activated': 'white' }}
              transition
              activatable
              color="primary"
            />
            <Components.ionic.button
              className="footerFiltersApply"
              buttonText="Apply"
              size="half"
              onClick={set}
              transition
              activatable
              color="primary"
            />
          </div>
        </IonToolbar>
      </IonFooter>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_filters_components_footer);


