import { connect, Component } from 'component';
import ovalLoader from 'assets/loaders/oval-white.svg';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_button extends Component {
  state = {};

  render() {
    const {
      buttonText,
      disabled,
      onClick,
      onDisabledClick,
      onDisabledDoubleClick,
      className,
      ariaLabel,
      updating,
      icon,
      iconLeft,
      iconRight,
      id,
      style,
    } = this.props;

    return (
      <button
        style={style}
        onClick={(e) => {
          e.preventDefault();
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
        className={`${className || 'btn btn-primary'} components_button ${disabled && 'disabled' || false}`}
        type="button"
        aria-label={ariaLabel || 'submit button'}
        id={id}
      >
        <div className="d-flex justify-content-center content-container align-items-center">
          {updating &&
            <img src={ovalLoader} alt="loading" style={{ height: '20px', width: '20px' }} />
          }
          <span className={`${updating ? 'updating' : ''}`}>
            {icon && !buttonText && <i className={`${icon}`} />}
            {icon && (!iconRight || iconLeft) && buttonText && <i className={`${icon} me-1`} />}
            {buttonText}
            {icon && iconRight && !iconLeft && buttonText && <i className={`${icon} ms-1`} />}
          </span>
        </div>
      </button>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_button);

