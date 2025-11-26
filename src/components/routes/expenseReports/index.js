import { connect, Component, bindActionCreators, Fragment } from 'component';

import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_routes_expenseReports extends Component {

  render() {
    return (
      <div className="components_routes_expenseReports">
        <div className="card">
          <div className="card-body">
            <Components.containers.expenseReports />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_routes_expenseReports);

