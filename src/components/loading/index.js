import { connect, Component, bindActionCreators, Fragment } from 'component';
// import { connect } from 'react-redux';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

// import './index.scss';

// const mapStateToProps = (state, props) => {
//   return ({});
// };

// const mapDispatchToProps = (dispatch, props) => {
//   return ({});
// };

// class components_loading extends Component {

//   componentDidMount() {}
//   componentWillUnmount() {}

//   render() {
//     return (
//       <div className="components_loading">
//         <p>components_loading</p>
//       </div>
//     );
//   }
// }

// export default connect(mapStateToProps, mapDispatchToProps)(components_loading);



export default () => {
  return (
    <span className="d-inline-block animated rotateIn infinite ms-3 me-3">
      <i className="mdi mdi-update" />
    </span>
  );
};
