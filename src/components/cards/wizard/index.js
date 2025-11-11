import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import classNames from 'classnames';

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

class components_cards_wizard extends Component {

  state = {
    selected: false,
  };

  componentDidMount() {
    const selected = this.props.children.findIndex((child) => {
      return child.props.current;
    });
    const selectedIndex = selected !== -1 ? selected : (this.props.children.length - 1);
    this.setState({ selected: selectedIndex });
  }
  componentWillReceiveProps(nextProps = {}) {
    const current = this.props.children.findIndex((child) => {
      return child.props.current;
    });
    const nextCurrent = nextProps.children.findIndex((child) => {
      return child.props.current;
    });

    if (nextCurrent !== -1 && current !== nextCurrent) {
      this.setState({ selected: nextCurrent });
    }
  }


  handleSelected(index, disabled) {
    return () => {
      if (!disabled) {
        this.setState({
          selected: index,
        });
      }
    };
  }

  renderSteps() {
    return this.props.children.map((child, index) => {
      const { disabled, first, last, current, description, label, done } = child.props;
      return (
        <li
          className={classNames(
            { disabled: !this.state.selected === index || disabled },
            { first },
            { last },
            { current: this.state.selected === index },
            { done })
          }
        >
          <a>
            <span className={'current-info audible'}>{label}</span>
            <span role={'button'} onClick={this.handleSelected(index, disabled)} className={'step'}>{index + 1}</span>
            {description}
          </a>
        </li>
      );
    });
  }

  renderSelected() {
    if (this.state.selected === false) {
      return (
        _try(() => this.props.children.find((child) => { return child.props.current; }).props.children) || 'Cannot render selected step'
      );
    }
    return (
      _try(() => this.props.children[this.state.selected].props.children) || 'Cannot render selected step'
    );
  }

  render() {
    return (
      <div className="components_cards_wizard">
        <div className="row">
          <div className="col-md-12">
            <div className="wizard-content">
              <form className="tab-wizard wizard-circle wizard clearfix">
                <div className="steps">
                  <ul>
                    {this.renderSteps()}
                  </ul>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            {this.renderSelected()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_cards_wizard);


