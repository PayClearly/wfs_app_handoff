import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    annotations: state.account.annotations.data.items,
  });
};

const mapDispatchToProps = { ...Store.forms };


class components_modals_invoicelabeller_components_overlay extends Component {

  state = {
    renderWidth: 0,
  }
  componentDidMount() {
    this.setState({ renderWidth: this.renderedAttachment.getBoundingClientRect().width })
  }
  componentWillUnmount() {
  }

  handleClick = (value, text, index) => {
    this.props.handleClick(value, text, index);
  };

  renderOverlay = (invoice) => {
    const { imgSizeX, imgSizeY } = this.props.annotations;
    const { lines = [] } = this.props;

    return lines.map((line, index) => (
      <Components.invoiceoverlaydropdown
        id={invoice.id}
        index={index}
        line={line}
        imgWidth={imgSizeX}
        imgHeight={imgSizeY}
        renderWidth={this.state.renderWidth}
        handleClick={this.handleClick}
      />
    ));
  }

  render() {
    const { invoice, annotations } = this.props;
    if (!invoice || !annotations) return null;
    return (
      <div className="components_modals_invoicelabeller_components_overlay h-100">
        {this.renderOverlay(invoice)}
        <div className="h-100" ref={(elem) => { this.renderedAttachment = elem; }} >
          <Components.containers.image
            className="p-0 position-absolute-top"
            alt="Invoice"
            path={_try(() => this.props.invoice.attachment.storagePath)}
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_invoicelabeller_components_overlay);


