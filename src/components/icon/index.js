import { connect, Component, bindActionCreators, Fragment } from 'component';

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

class components_icon extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <div className="components_icon position-relative">
        <i style={{ ...(this.props.style || {}) }} className={`mdi mdi-${this.props.icon}`} />
        {
          this.props.alertIcon && this.props.alert &&
          <Fragment>
            <i style={{ ...(this.props.alertStyle || {}) }} className="notification-icon text-white position-absolute mdi mdi-circle" />
            <i style={{ ...(this.props.alertStyle || {}) }} className={`notification-icon text-danger position-absolute mdi mdi-${this.props.alertIcon}`} />
          </Fragment>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_icon);


