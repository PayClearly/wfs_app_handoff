import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import { Collapse } from 'react-collapse';


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_menu extends Component {
  state = {};


  componentWillReceiveProps(nextProps = {}) {
    if (!this.props.reset && nextProps.reset) {
      this.setState({ open: null });
    }
  }


  renderItems = () => {
    const { items, hasActions, onClick } = this.props;

    return items.map((item, index) => {
      const { title, active, disabled, subItems } = item;
      const hasSubItems = _try(() => subItems.length);

      if (hasActions) {
        return (
          <Fragment>
            <button
              type="button"
              className={`list-group-item list-group-item-action small truncate${active ? ' active' : ''}${this.state.open === title ? ' open' : ''}`}
              disabled={disabled}
              onClick={() => {
                if (hasSubItems) {
                  this.setState((prevState) => {
                    return { open: prevState.open === title ? null : title };
                  });
                } else {
                  onClick(title);
                }
              }}
            >
              {title}
            </button>
            {!!hasSubItems &&
              <Collapse isOpened={this.state.open === title || active} >
                <ul className="m-0 subItems">
                  {subItems.map((subItem) => {
                    const subTitle = subItem.title;
                    const subActive = subItem.active;

                    return (
                      <li
                        className={`subItem small${subActive ? ' active' : ''}`}
                        onClick={() => { onClick(title, subTitle); }}
                      >
                        {subTitle}
                      </li>
                    );
                  })}

                </ul>
              </Collapse>
            }
          </Fragment>
        );
      }

      return <li className={`list-group-item small ${disabled ? ' disabled' : ''}${active ? ' active' : ''}`}>{title}</li>;
    });
  }

  render() {
    const { menuTitle, isFlush, hasActions } = this.props;

    return (
      <div className="components_menu">
        <span className="menu-small-cap text-uppercase">{menuTitle}</span>
        {hasActions &&
          <div className={`list-group${isFlush ? ' list-group-flush' : ''}`}>
            {this.renderItems()}
          </div>
        }
        {!hasActions &&
          <ul className={`list-group${isFlush ? ' list-group-flush' : ''}`}>
            {this.renderItems()}
          </ul>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_menu);


