import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
  });
};

const mapDispatchToProps = {
  ...Store.forms,
  updateAnnotation: Store.account.updateAnnotation,
};


class components_invoiceoverlaydropdown extends Component {

  state = {
    name: 'Components.forms.invoicedetails',
    dropdownOpen: false,
    labels: [{
      display: 'Vendor',
      value: 'vendorName',
    }, {
      display: 'Invoice Number',
      value: 'invoiceNumber',
    }, {
      display: 'Invoice Date',
      value: 'invoiceDate',
    }, {
      display: 'Amount',
      value: 'amount',
    }, {
      display: 'Payment Terms',
      value: 'paymentTerms',
    }, {
      display: 'Due Date',
      value: 'dueDate',
    }, {
      display: 'Memo',
      value: 'memo',
    }],
  }
  componentDidMount() {
    if (this.props.line.label) {
      this.setState({ labelledAs: this.props.line.label });
    }
  }


  toggle = () => {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  handleClick = (value) => {
    this.props.handleClick(value, this.props.line.text, this.props.index);
    this.toggle();
  };

  render() {
    const { id, line, imgWidth, imgHeight, renderWidth } = this.props;
    const renderHeight = (renderWidth / imgWidth) * imgHeight;
    const { label, text, xs, xe, ys, ye } = line;
    const scaleX = n => n / imgWidth * renderWidth;
    const scaleY = n => n / imgHeight * renderHeight;
    const top = scaleY(ys) - 3;
    const left = 10 + scaleX(xs);
    const height = 6 + scaleY(ye - ys);
    const width = 10 + scaleX(xe - xs);

    const focused = !!label && this.props.forms['Components.forms.invoicedetails'][id][label].focused;

    return (
      <Dropdown
        className="components_invoiceoverlaydropdown"
        direction="right"
        isOpen={this.state.dropdownOpen}
        toggle={this.toggle}
        style={{ top, left }}
      >
        <DropdownToggle
          className={`${(label || focused) && 'border border-primary'} ${focused && 'focused'}`}
          style={{ width, height }}
        />
        <DropdownMenu style={{ zIndex: 4 }}>
          {
            this.state.labels.map(({ display, value }) => <DropdownItem onClick={() => this.handleClick(value)}>{display}</DropdownItem>)
          }
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_invoiceoverlaydropdown);


