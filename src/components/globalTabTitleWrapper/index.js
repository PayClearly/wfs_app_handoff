import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_globalTabTitleWrapper extends Component {




  render() {
    return (
      <div className="d-inline-block components_globalTabTitleWrapper">
        <div
          className="d-flex align-items-center mb-3 title-container"
          onClick={() => {
            if (typeof this.props.onClick === 'function') this.props.onClick();
          }}
          role="tooltip"
        >
          <h2 className="card-title me-2 mb-0">{this.props.title}</h2>
          <i
            className={`mdi ${this.props.hideCreateForm ? 'mdi-plus-circle' : 'mdi-arrow-up-drop-circle'} text-${this.props.hideCreateForm ? 'success' : 'secondary'} mdi-24px`}
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_globalTabTitleWrapper);


