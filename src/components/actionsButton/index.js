import { connect, Component, Fragment } from 'component';

// Third Party Imports ...
import { Popover, PopoverBody } from 'reactstrap';
import classNames from 'classnames';
import Components from 'components';

import './index.scss';

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_actionsButton extends Component {
  state = {};

  _onClickTogglePopover = () => {
    this.setState((prevState) => ({
      popoverOpen: !prevState.popoverOpen,
    }));
  };

  render() {
    return (
      <div
        className={classNames('components_actionsButton', this.props.containerClassNames)}
        id={this.props.id || 'actions-button'}
        role="tooltip"
      >
        <Components.button
          buttonText={this.props.buttonText || 'Actions'}
          icon={this.props.noIcon ? false : 'mdi mdi-menu-down'}
          iconRight={!this.props.noIcon}
          className={classNames('actions-button', this.props.buttonClassNames)}
          onClick={(e) => {
            e.stopPropagation();
            this._onClickTogglePopover();
          }}
        />
        <Popover
          placement={this.props.popoverPlacement || 'bottom'}
          isOpen={this.state.popoverOpen}
          target={this.props.id || 'actions-button'}
          toggle={() => { this._onClickTogglePopover(); }}
          trigger="legacy"
          className="components_actionsButton action-popover"
        >
          <PopoverBody>
            {
              (_try(() => this.props.actionContent) || []).map((item, i) => {
                const {
                  title,
                  disabled,
                  onDisabledClick,
                  onDisabledDoubleClick,
                } = item;

                return (
                  <Fragment>
                    {i > 0 && <hr className="my-1" />}
                    <p
                      className={`m-0 action-item px-1${disabled ? ' disabled' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (disabled && onDisabledClick) {
                          if (typeof onDisabledClick === 'function') { onDisabledClick(); }
                          this._onClickTogglePopover();
                        }
                        if (disabled && onDisabledDoubleClick) {
                          if (this.state.disabledClickCount) {
                            if (typeof onDisabledDoubleClick === 'function') { onDisabledDoubleClick(); }
                            this._onClickTogglePopover();
                          } else {
                            this.setState({ disabledClickCount: 1 });
                            setTimeout(() => { this.setState({ disabledClickCount: 0 }); }, 300);
                          }
                        }
                        if (!disabled && item.onClick) {
                          if (typeof item.onClick === 'function') { item.onClick(); }
                          this._onClickTogglePopover();
                        }
                      }}
                    >
                      {title}
                    </p>
                  </Fragment>
                );
              })
            }
          </PopoverBody>
        </Popover>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_actionsButton);

