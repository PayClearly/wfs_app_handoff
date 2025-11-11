import { connect, Component, bindActionCreators, Fragment } from 'component';

import Selectors from 'selectors';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    featureFlag: Selectors.featureFlags(state)[props.featureKey],
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_featureFlagWrapper extends Component {




  render() {
    return (
      <Fragment>
        {this.props.featureFlag ? this.props.children : null}
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_featureFlagWrapper);


