import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    accountResources: state.account,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_modals_areyousure extends Component {
  state = {
    params: {},
    cancelling: false,
  }

  componentDidMount() {
    if (this.props.selectors && this.props.selectors.length) {
      const params = {};
      this.props.selectors.forEach((selector) => {
        params[selector.name] = selector.default;
      });
      this.setState({
        params,
      });
    }
    // set up the inital props
  }
  componentWillUnmount() { }

  render() {
    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content components_modals_areyousure">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">{this.props.title}</h3>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md mb-4" >
                <h3>Are you sure you want to do this?</h3>
                <p>{this.props.content}</p>
              </div>
            </div>
            {this.props.selectors && this.props.selectors.length &&
              <div className="row mb-2">
                {this.props.selectors
                  .map((selector) => {
                    return (
                      <div className="col-md-12">
                        <h4 className="ps-4">

                          <input
                            type="checkbox"
                            className="form-check-input"
                            onClick={() => {
                              this.setState({
                                params: {
                                  ...this.state.params,
                                  [selector.name]: !this.state.params[name],
                                },
                              });
                            }}
                            checked={this.state.params[name]}
                          />
                          {selector.text}
                        </h4>
                      </div>);
                  })
                }
              </div>
            }
          </div>
          <div className="modal-footer">
            <Components.button
              onClick={() => {
                this.props.onYes(this.state.params);
                if (this.props.checkForSuccess && typeof this.props.checkForSuccess === 'function') {
                  this.setState({ cancelling: true });
                  let count = 0;
                  const callBack = (cb) => {
                    if (this.props.checkForSuccess(this.props.accountResources) || count > 30) {
                      this.props.close();
                    } else {
                      count += 1;
                      setTimeout(() => {
                        cb(cb);
                      }, 500);
                    }
                  };
                  setTimeout(() => {
                    callBack(callBack);
                  }, 500);
                } else {
                  this.props.close();
                }
              }}
              updating={this.state.cancelling}
              disabled={false}
              buttonText={this.props.yesText}
              className={`btn btn-${this.props.yesButtonColor || 'danger'}`}
            />
            <button
              onClick={this.props.close}
              className="btn btn-secondary"
              type="button"
              aria-label="reset password button"
              disabled={false}
            >{this.props.noText}</button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_areyousure);


