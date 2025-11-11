import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    users: state.users.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_badges_beingHandledBy extends Component {

  state = {};




  render() {
    const userIdOfHandler = this.props.paymentStatus.sent && this.props.paymentStatus.sent.beingHandledBy;
    let usernameOfHandler;
    if (userIdOfHandler === 'taikoBot') usernameOfHandler = 'Taiko Bot';
    else usernameOfHandler = userIdOfHandler && this.props.users[userIdOfHandler] && this.props.users[userIdOfHandler].label;

    if (this.props.users && userIdOfHandler) {
      return (
        <div
          className="components_badges_beingHandledBy"
          onMouseMove={(e) => { this.setState({ x: e.clientX, y: e.clientY }); }}
          onMouseEnter={() => { this.setState({ hover: true }); }}
          onMouseLeave={() => { this.setState({ hover: false }); }}
        >
          {this.state.hover && <h6
            className="cc-tooltiptext"
            style={{
              position: 'fixed',
              top: this.state.y - 5,
              left: this.state.x + 15,
            }}
          >
            <span>{`${usernameOfHandler || 'Someone'} is working on this payment`}</span>
          </h6>}
          <Components.icon icon="eye-outline" />
        </div>
      );
    }
    return null;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_beingHandledBy);


