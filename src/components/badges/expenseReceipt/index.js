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

class components_badges_expenseReceipt extends Component {




  render() {
    return (this.props.receipt ?
      <i className="mdi mdi-receipt text-primary mdi-24px" /> :
      <i className="mdi mdi-receipt text-secondary mdi-24px" />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_badges_expenseReceipt);


