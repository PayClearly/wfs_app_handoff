import { Children, cloneElement } from 'react';
import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import classNames from 'classnames';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_clicktocopytextwrapper extends Component {
  state = {
    copied: false,
  }

  componentDidMount() { }
  componentWillUnmount() { }

  copyToClipboard = (str) => {
    if (window.getSelection && document.createRange) {
      const el = document.createElement('textarea');
      el.value = str;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      const selected =
        document.getSelection().rangeCount > 0
          ? document.getSelection().getRangeAt(0)
          : false;
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      if (selected) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(selected);
      }
      if (typeof this.props.onCopy === 'function') {
        this.props.onCopy();
      }
      this.setState({ copied: true }, this.hideCopiedMessage);
    } else {
      console.warn('Browser does not support copying to clipboard'); // eslint-disable-line
    }
  };

  hideCopiedMessage = () => {
    setTimeout(() => { this.setState({ copied: false }); }, 800);
  }

  render() {
    const { children } = this.props;
    return (
      <div
        className="components_clicktocopytextwrapper"
        style={{
          position: 'relative',
        }}
        onMouseMove={(e) => { this.setState({ x: e.clientX, y: e.clientY }); }}
        onMouseEnter={() => { this.setState({ hover: true }); }}
        onMouseLeave={() => { this.setState({ hover: false }); }}
      >
        {
          Children.map(children, (child) => {
            const { value } = this.props;
            const onClick = (e) => { if (this.props.stopPropagation) e.stopPropagation(); return this.copyToClipboard(this.props.value, e); };
            const className = classNames(child.props.className, 'cc-area', this.state.hover && 'copy-text-hover');

            return cloneElement(child, { value, onClick, className });
          })
        }
        {this.props.showTooltip && this.state.hover && (
          <h6
            className="cc-tooltiptext"
            style={{
              position: 'fixed',
              top: this.state.y - 5,
              left: this.state.x + 15,
            }}
          >
            {!this.state.copied ? <span>{this.props.copyText && 'Click to copy '}<i className="mdi mdi-content-copy" /></span> : 'Copied'}
          </h6>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_clicktocopytextwrapper);


