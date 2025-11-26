import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_photooverview extends Component {

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

