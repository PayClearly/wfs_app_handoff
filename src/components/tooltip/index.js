import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import md5 from 'md5';
import * as Reactstrap from 'reactstrap';

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

class components_tooltip extends Component {
  state = {
    tooltipOpen: false,
    id: false,
  }

  componentDidMount() {
    this.setState({
      id: `tooltip_${md5(Math.random())}`,
    });
  }



  toggle() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen,
    });
  }

  render() {
    if (!this.state.id) {
      return <span />;
    }
    const title = this.props.children[0];
    const content = this.props.children[1];
    return (
      <div style={this.props.style} className={this.props.className}>
        <span id={this.state.id}>{title}</span>
        <Reactstrap.Tooltip delay={{ show: 0, hide: 0 }} placement={this.props.placement || 'top'} isOpen={this.state.tooltipOpen} target={this.state.id} toggle={(e) => { return this.toggle(e); }}>
          {content}
        </Reactstrap.Tooltip>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tooltip);


