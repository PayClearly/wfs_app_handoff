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

class components_cards_reporttemplates extends Component {




  render() {
    return (
      <div className="components_cards_reporttemplates card card-body">
        <Components.tables.reporttemplates />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_cards_reporttemplates);


