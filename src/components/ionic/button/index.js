import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonButton } from '@ionic/react';

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

class components_ionic_button extends Component {
  state = {
    activated: false,
  }
  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const {
      buttonText,
      disabled,
      onClick,
      onDisabledClick,
      onDisabledDoubleClick,
      expand,
      className,
      ariaLabel,
      updating,
      icon,
      iconLeft,
      iconRight,
      size,
      transition,
      activatable,
      color,
    } = this.props;
    // TODO: Implement and Allow Button Transitions
    // Color can be values: 'primary', ... add more when needed
    return (
      <IonButton
        mode="md"
        strong
        expand={expand}
        className={`${className} components_ionic_button ${color}${disabled ? ' disabled' : ''}${size ? ` ${size}` : ' full'}${transition ? ' transition' : ''}${this.state.activated ? ' activated' : ' default'}`}
        onClick={(e) => {
          e.preventDefault();
          if (activatable) {
            this.setState({ activated: true }, () => {
              setTimeout(() => {
                this.setState({ activated: false });
              }, 300);
            });
          }
          if (disabled && onDisabledClick) {
            onDisabledClick(e);
          }
          if (disabled && onDisabledDoubleClick) {
            if (this.state.disabledClickCount) {
              onDisabledDoubleClick(e);
            } else {
              this.setState({ disabledClickCount: 1 });
              setTimeout(() => { this.setState({ disabledClickCount: 0 }); }, 300);
            }
          }
          if (!disabled && onClick) {
            onClick(e);
          }
        }}
      >
        {buttonText}
      </IonButton>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_button);


