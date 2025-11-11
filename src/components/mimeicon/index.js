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

class components_mimeicon extends Component {




  render() {
    if (this.props.contentType.includes('pdf')) {
      return (<div className={'components_mimeicon d-flex me-3 mdi mdi-file-pdf'} />);
    }
    if (this.props.contentType.includes('image')) {
      return (<div className={'components_mimeicon d-flex me-3 mdi mdi-file-image'} />);
    }
    if (this.props.contentType.includes('xls') || this.props.contentType.includes('sheet')) {
      return (<div className={'components_mimeicon d-flex me-3 mdi mdi-file-excel'} />);
    }
    if (this.props.contentType.includes('ppt') || this.props.contentType.includes('presentation')) {
      return (<div className={'components_mimeicon d-flex me-3 mdi mdi-file-powerpoint'} />);
    }
    return (<div className={'components_mimeicon d-flex me-3 mdi mdi-file-document'} />);
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_mimeicon);


