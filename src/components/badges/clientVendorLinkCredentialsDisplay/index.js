import { connect, Component, bindActionCreators, Fragment } from 'component';

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

class components_badges_clientVendorLinkCredentialsDisplay extends Component {




  render() {
    const { data } = this.props;

    let toRender;
    switch (data) {
      case 'valid':
        toRender = (
          <Components.tooltip className="d-inline">
            <span className="text-success" ><i className="mdi mdi-check mdi-24px" /></span>
            <span>Valid</span>
          </Components.tooltip>
        );
        break;
      case 'invalid':
        toRender = (
          <Components.tooltip className="d-inline">
            <span className="text-danger" ><i className="mdi mdi-alert-circle-outline mdi-24px" /></span>
            <span>Invalid</span>
          </Components.tooltip>
        );
        break;
      case 'none':
      default:
        toRender = <span>-</span>;
        break;
    }
    return (
      <span className="components_badges_clientVendorLinkCredentialsDisplay">
        {toRender}
      </span>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_badges_clientVendorLinkCredentialsDisplay);


