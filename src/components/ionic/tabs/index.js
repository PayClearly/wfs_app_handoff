import { connect, Component, bindActionCreators, Fragment } from 'component';


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

class components_ionic_tabs extends Component {




  render() {
    const tabs = (this.props.children.length && this.props.children) || [this.props.children];

    return (
      <div className="components_ionic_tabs">
        <p>components_ionic_tabs</p>
        {tabs}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_tabs);


