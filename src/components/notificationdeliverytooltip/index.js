import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_notificationdeliverytooltip extends Component {




  render() {
    return (
      <div className="components_notificationdeliverytooltip">
        <Components.tooltip className="d-inline">
          <span className="when"><i className="mdi mdi-information" />When will I get this?</span>
          <span>{this.props.tooltipDisplay}</span>
        </Components.tooltip>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_notificationdeliverytooltip);


