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

class components_ionic_filters_filterModal extends Component {
  // Size will determine the height of the modal at the bottom



  render() {

    switch (this.props.type) {
      case 'documentsFilter':
      default:
        return (
          <Components.ionic.filters.documentsFilter {...this.props} />
        );
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_filters_filterModal);


