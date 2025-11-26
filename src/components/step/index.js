import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_step extends Component {

  render() {
    return this.props.children;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_step);

