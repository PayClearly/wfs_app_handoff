import { connect, Component, bindActionCreators, Fragment } from 'component';

import Components from 'components';

import { Collapse } from 'react-collapse';

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

class components_overviews_paymentstatus_modules_lineItems extends Component {




  render() {
    const { id } = this.props;

    return (
      <Fragment>
        <hr className="m-0" />
        <h2 className="m-0 py-3 d-inline-block">Line Items</h2>
        <div className="components_overviews_paymentstatus_modules_lineItems ps-4">
          <Components.tables.lineItems tableKey={id} />
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_overviews_paymentstatus_modules_lineItems);


