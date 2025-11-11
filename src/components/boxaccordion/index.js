import { connect, Component } from 'component';

// Third Party Imports ...
import { Collapse } from 'react-collapse';
import classnames from 'classnames';

import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_boxaccordion extends Component {

  handleAccordionClick = () => {
    this.props.onSelect(this.props.label);
  };

  render() {
    // const active = this.props.label === this.props.selected;
    return (
      <div className={`components_boxaccordion${this.props.noBottomMargin ? '' : ' mb-3'}`}>
        <div
          className={
            classnames('accordion-row', { active: this.props.selected }, this.props.leftAligned && 'left-aligned')
          }
        >
          <a
            className="accordion-link"
            role="presentation"
            onClick={this.handleAccordionClick}
          >
            <div className={
              classnames('mdi', 'accordion-header', this.props.selected ? 'mdi-chevron-down' : 'mdi-chevron-right')
            }
            >
              <h6 className="ms-2">{this.props.label || 'Show Optional Fields'}</h6>
            </div>
            <Collapse isOpened={!this.props.selected}>
              {this.props.closedContent ? this.props.closedContent : null}
            </Collapse>
          </a>
        </div>
        <Collapse isOpened={this.props.selected}>
          {this.props.children}
        </Collapse>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_boxaccordion);
