import { connect, Component, bindActionCreators, Fragment } from 'component';


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

class components_ripple extends Component {

  state = {
    ripples: {},
    count: 0,
  };




  cleanUp = () => {
    this.setState({ count: 0, ripples: {} });
  }

  callCleanUp = (cleanUp, delay) => {
    if (this.props.disabled) return null;

    return () => {
      clearTimeout(this.bounce);
      this.bounce = setTimeout(() => {
        cleanUp();
      }, delay);
    };
  }

  showRipple = (e) => {
    if (this.props.disabled) return null;

    const container = e.currentTarget;
    const size = container.offsetWidth;
    const pos = container.getBoundingClientRect();
    const x = e.pageX - pos.x - (size / 2);
    const y = e.pageY - pos.y - (size / 2);
    const ripples = { styles: { top: `${y}px`, left: `${x}px`, height: `${size}px`, width: `${size}px` }, classes: this.props.classes };
    this.setState((prevState) => {
      const count = prevState.count + 1;
      return {
        ripples: { ...prevState.ripples, [count]: ripples },
        count,
      };
    });
  }

  renderRipple = () => {
    const { ripples = {} } = this.state;
    const rippleKeys = Object.keys(ripples);
    if (_try(() => rippleKeys.length)) {
      return (
        rippleKeys.map((key, index) => {
          return <span key={`count_${index}`} style={{ ...ripples[key].styles }} className={`${ripples[key].classes ? ` ${ripples[key].classes}` : ''}`} />
        })
      );
    }
    return null;
  }

  render() {
    const { children = null, classes = '', onClick = null, disabled = null } = this.props;

    return (
      <div className={`components_ripple${classes ? ` ${classes}` : ''}${disabled ? ' disabled' : ''}`} onClick={onClick}>
        {children}
        <div className="rippleContainer" onMouseDown={this.showRipple} onMouseUp={this.callCleanUp(this.cleanUp, 2000)}>
          {this.renderRipple()}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ripple);


