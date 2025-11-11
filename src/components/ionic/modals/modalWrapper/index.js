import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonModal, IonIcon, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonFooter, createAnimation } from '@ionic/react';
import { createRef } from 'react';
import { close } from 'ionicons/icons';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const context = require.context('../', true, /\.js$/);
const MODALS = _importNestedDirectory(context);

const mapStateToProps = (state, props) => {
  return ({
    modals: state.router.modals,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeModal: (name) => {
      dispatch(Store.router.closeModal(name));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_modals_modalWrapper extends Component {
  state = {
    display: false,
    show: false,
    dismissing: false,
  }

  componentDidMount() {}
  componentWillUnmount() {}

  render() {
    const { modals = [] } = this.props;

    const animations = {
      slideLeft: {
        enter: (baseEl) => {
          const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop'))
            .fromTo('opacity', '0.01', '0.5');
      
          const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper'))
            .keyframes([
              { offset: 0, opacity: '1', transform: 'translateX(100%)' },
              { offset: 1, opacity: '1', transform: 'translateX(0%)' },
            ]);
      
          return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(200)
            .addAnimation([backdropAnimation, wrapperAnimation]);
        },
        leave: (baseEl) => {
          return animations.slideLeft.enter(baseEl).direction('reverse');
        },
      },
      slideRight: {
        enter: (baseEl) => {
          const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop'))
            .fromTo('opacity', '0.01', '0.5');
      
          const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper'))
            .keyframes([
              { offset: 0, opacity: '1', transform: 'translateX(-100%)' },
              { offset: 1, opacity: '1', transform: 'translateX(0%)' },
            ]);
      
          return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(200)
            .addAnimation([backdropAnimation, wrapperAnimation]);
        },
        leave: (baseEl) => {
          return animations.slideRight.enter(baseEl).direction('reverse');
        },
      },
      slideUp: {
        enter: (baseEl) => {
          const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop'))
            .fromTo('opacity', '0.01', '0.5');
          
          const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper'))
          .keyframes([
              { offset: 0, opacity: '1', transform: 'translateY(100%)' },
              { offset: 1, opacity: '1', transform: 'translateY(0%)' },
            ]);
            // .fromTo('opacity', '0.01', '1');
            // translate3d(0, 40px, 0)
            // .fromTo(['transform', 'translate3d(0, 400px, 0)', 'translate3d(0, 0, 0)']);
            // .fromTo('background', 'blue', 'red');
                      return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(200)
            .addAnimation([backdropAnimation, wrapperAnimation]);
        },
        leave: (baseEl) => {
          return animations.slideUp.enter(baseEl).direction('reverse');
        },
      },
      sharedElement: {
        enter: (baseEl) => {
          const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop'))
            .fromTo('opacity', '0.01', '0.5');
      
          const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper'))
            .keyframes([
              { offset: 0, opacity: '0', transform: 'translateX(0%)' },
              { offset: 0.5, opacity: '0.75', transform: 'translateX(0%)' },
              { offset: 1, opacity: '1', transform: 'translateX(0%)' },
            ]);
      
          return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(300)
            .addAnimation([backdropAnimation, wrapperAnimation]);
        },
        leave: (baseEl) => {
          return animations.sharedElement.enter(baseEl).direction('reverse');
        },
      },
    };

    const reversedModals = [...modals].reverse();

    return (
      <Fragment>
        {reversedModals.map((modal, index) => {
          const modalName = modal.name;
          const modalData = modal.data;
          const Comp = MODALS[modalName];
          const modalRef = createRef();
          return (
            <IonModal
              ref={modalRef}
              key={modalName}
              className="components_ionic_modals_modalWrapper"
              isOpen
              onDidDismiss={(e) => {
                this.props.closeModal(modal.name);
                this.setState({ dismissing: false });
              }}
              onWillDismiss={() => this.setState({ dismissing: true })}
              enterAnimation={animations[modalData.animation || 'slideUp'].enter}
              leaveAnimation={animations[modalData.animation || 'slideUp'].leave}
              swipeToClose
            >


              <Comp data={modalData} dismissing={this.state.dismissing} modal={modalRef} />
              
            </IonModal>
          );
        })}
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_modals_modalWrapper);

// Internal Helper Functions ... 
function _getDotNotatedPath(path) { return `Components.ionic.modals.${path.slice(2, -9).replace('/', '.')}`; }

function _importNestedDirectory(directory) {
  return directory.keys().reduce(((acc, key) => {
    const name = _getDotNotatedPath(key);
    if (!name || name === '.' || !context(key).default) return acc; // return if does not match structure
    acc[name] = context(key).default;
    return acc;
  }), {});
}

// GENERATOR_TYPE='component';
