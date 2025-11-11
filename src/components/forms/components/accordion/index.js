import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import { Collapse, UnmountClosed } from 'react-collapse';
import classnames from 'classnames';

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

class components_forms_components_accordion extends Component {
  state = {
    isOpen: false,
  };

  componentDidMount() {
    if (this.props.initialOpen) this.setState({ isOpen: true });
  }
  componentWillUnmount() { }

  handleAccordionClick = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  render() {
    return (
      <div className={`components_forms_components_accordion${this.props.noBottomMargin ? '' : ' mb-3'}`}>
        <div
          className={classnames('accordion-row', { active: this.state.isOpen }, this.props.leftAligned && 'text-start')}
        >
          <a
            className="accordion-link"
            // must include role for accessibility
            role="presentation"
            onClick={this.handleAccordionClick}
          >
            {!this.state.isOpen ?
              <div className="mdi mdi-plus-box text-start"><span className="ms-2">{this.props.showLabel || 'Show Optional Fields'}{this.props.showDanger && <i className="ps-2 mdi mdi-alert-circle-outline text-danger" />}{this.props.warningText && <span className="text-warning"><i className="ps-2 mdi mdi-alert-circle-outline" /> {this.props.warningText} </span>}</span></div>
              :
              <div className="mdi mdi-minus-box text-start"><span className="ms-2">{this.props.hideLabel || 'Hide Optional Fields'}{this.props.showDanger && <i className="ps-2 mdi mdi-alert-circle-outline text-danger" />}{this.props.warningText && <span className="text-warning"><i className="ps-2 mdi mdi-alert-circle-outline" /> {this.props.warningText} </span>}</span></div>
            }
          </a>
        </div>
        {
          this.props.unmountClosed ?
            <UnmountClosed isOpened={this.state.isOpen}>
              {this.props.children}
            </UnmountClosed> :
            <Collapse isOpened={this.state.isOpen}>
              {this.props.children}
            </Collapse>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_components_accordion);


