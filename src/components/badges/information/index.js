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

class components_badges_information extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <div className="components_badges_information">
        <p>components_badges_information</p>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_information);


