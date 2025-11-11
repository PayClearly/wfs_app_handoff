import { connect, Component, bindActionCreators, Fragment } from 'component';
import { Children } from 'react';

// Third Party Imports ...


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_card extends Component {




  render() {
    return (Children.count(this.props.children) === 1)
      ? (
        <div className={`components_card card mb-4${this.props.useLabel ? ' card-with-label' : ''}`}>
          {this.props.useLabel && <p className="card-label px-1"><strong>{this.props.title}</strong></p>}
          <div className="card-body">
            {!this.props.useLabel && <h4 className="card-title mb-3">{this.props.title}</h4>}
            {this.props.children}
          </div>
        </div>
      )
      : (
        <Fragment>
          {<div>Incorrect number of children (expecting 1 child component)</div>}
        </Fragment>
      );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_card);


