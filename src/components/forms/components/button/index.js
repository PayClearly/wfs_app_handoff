import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_forms_components_button extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const {
      buttonText,
      disabled,
      onClick,
      onDisabledClick,
      onDisabledDoubleClick,
      className,
      style,
      ariaLabel,
      updating,
      icon,
    } = this.props;

    return (
      <button
        style={style}
        onClick={(e) => {
          e.preventDefault();
          if (disabled && onDisabledClick) {
            onDisabledClick();
          }
          if (disabled && onDisabledDoubleClick) {
            if (this.state.disabledClickCount) {
              onDisabledDoubleClick();
            } else {
              this.setState({ disabledClickCount: 1 });
              setTimeout(() => { this.setState({ disabledClickCount: 0 }); }, 300);
            }
          }
          if (!disabled && onClick) {
            onClick();
          }
        }}
        className={`${className || 'btn btn-primary'} ${(disabled || updating) && 'disabled' || false}`}
        type="button"
        aria-label={ariaLabel || 'submit button'}
      >
        {(() => {
          if (updating) {
            return (
              <Components.spinner white height={'20px'} />
            );
          }
          if (icon) {
            return (
              <Fragment >
                <i className={icon} />
                <span>
                  {buttonText || 'Submit'}
                </span>
              </Fragment>
            );
          }

          return (
            <span>{buttonText || 'Submit'}</span>
          );
        })()}
      </button>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_button);


