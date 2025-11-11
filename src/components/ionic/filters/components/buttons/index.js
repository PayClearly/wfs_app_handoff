import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonButton, IonLabel } from '@ionic/react';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
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

class components_ionic_filters_components_buttons extends Component {




  render() {
    const {
      title,
      options,
      value,
      set,
      keyValue,
    } = this.props;
    const buttonCount = options.length;
    const buttonWidth = (window.innerWidth - 50) / buttonCount;

    return (
      <div className="components_ionic_filters_components_buttons">
        <IonLabel className="buttonsLabel">{title}</IonLabel>
        <br />
        {options.map((val) => {
          return (
            <IonButton
              className={`filterButtons${val === value ? ' active' : ''}`}
              style={{ width: buttonWidth }}
              onclick={() => set(keyValue, val)}
              mode="ios"
              key={val}
            >
              {val}
            </IonButton>
          );
        })}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_filters_components_buttons);


