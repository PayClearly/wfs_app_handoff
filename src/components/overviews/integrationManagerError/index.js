import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    integrationMeta: _try(() => Selectors.integrations(state)[props.integrationName].data.metas[props.resourceName], {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_overviews_integrationManagerError extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { integrationMeta, id } = this.props;

    // need to get link object or at least mapping of idB to idA for this to work
    return (
      <div className="components_overviews_integrationManagerError">
        <div className="row">
          <div className="col-12">
            <strong>Has Error</strong>
            <br />
            <p className="text-muted">{_try(() => integrationMeta.errors[id]) ? 'True' : 'False'}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_integrationManagerError);


