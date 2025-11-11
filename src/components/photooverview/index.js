import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

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

class components_photooverview extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    if (this.props.src) {
      return (
        <img src={this.props.src} alt={this.props.alt || 'photoOverview'} width={this.props.outputWidth || 200} height={this.props.outputHeight || 200} />
      );
    }
    return null;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_photooverview);


