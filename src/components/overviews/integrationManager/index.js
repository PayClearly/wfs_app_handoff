import { connect, Component, bindActionCreators, Fragment } from 'component';

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

class components_overviews_integrationManager extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { data, resourceDef } = this.props;
    const notSetTag = (<i>Not set</i>);

    return (
      <div className="components_overviews_integrationManager">
        <div className="row">
          {Object.keys(resourceDef.properties).map((property) => {
            return (
              <div className="col-12">
                <strong>{property}</strong>
                <br />
                <p className="text-muted">{data[property] || notSetTag}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_integrationManager);


