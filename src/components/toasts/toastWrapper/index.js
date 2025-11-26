import { connect, Component } from 'component';
import { CSSTransition } from 'react-transition-group';
import Store from 'store';

import './index.scss';

const context = require.context('../', true, /\.js$/);
const toasts = _importNestedDirectory(context);

const mapStateToProps = (state, props) => {
  return ({
    toast: state.router.toast,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    closeToast: () => {
      dispatch(Store.router.closeToast());
    },
  });
};

class components_toasts_toastWrapper extends Component {

  componentDidMount() {}

  componentWillUnmount() {}

  handleToastClose = () => {
    this.props.closeToast();
  }

  // No use of this exists, but being left in for now in case we want to update and use it in the future
  render() {
    const { name, data } = this.props.toast;

    const Comp = toasts[name];
    return (
      <div
        className="components_toasts_toastWrapper"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="toast"
        onClick={this.handleToastClose}
      >
        <CSSTransition
          classNames="toast-wrapper-transitioner"
          in={!!Comp && this.props.toast.show}
          timeout={300}
        >
          <div className="toast-container">
            { !!Comp && <Comp {...data} close={this.handleToastClose} />}
          </div>
        </CSSTransition>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_toasts_toastWrapper);

function _getDotNotatedPath(path) { return `Components.toasts.${path.slice(2, -9).replace('/', '.')}`; }

function _importNestedDirectory(directory) {
  return directory.keys().reduce(((acc, key) => {
    const name = _getDotNotatedPath(key);
    if (!name || name === '.' || !context(key).default) return acc; // return if does not match structure
    acc[name] = context(key).default;
    return acc;
  }), {});
}
