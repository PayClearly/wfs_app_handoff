import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_badges_needsattention extends Component {




  render() {
    const { data } = this.props;
    return (
      <span className="text-danger">
        {data && <i className="mdi mdi-alert-circle-outline" />}
      </span>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_needsattention);


