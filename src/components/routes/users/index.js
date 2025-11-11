import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_routes_users extends Component {




  render() {
    return (
      <Fragment>
        <Components.creators.user />
        <div className="card">
          <div className="card-body">
            <h2 className="card-title mb-3">Users</h2>
            <Components.tables.users />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_users);


