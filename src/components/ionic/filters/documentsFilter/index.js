import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonModal, IonContent } from '@ionic/react';

import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_filters_documentsFilter extends Component {

  componentDidMount() {
    this.setState({ filters: this.props.activeFilters || this.props.defaultFilters });
  }

  componentWillReceiveProps(nextProps = {}) {
    if (Utils.isDeepEqual(this.props.activeFilters, nextProps.activeFilters)) {
      this.setState({ filters: nextProps.activeFilters });
    }
  }

  componentWillUnmount() { }

  setFilters = (key, val) => {
    this.setState({ filters: { ...this.state.filters, [key]: val } }, () => {
      this.props.setFilters(this.state.filters);
    });
  };

  pressApply = () => {
    setTimeout(() => {
      this.props.pressApply();
    }, 300);
  };

  resetFilters = () => {
    setTimeout(() => {
      this.setState({ filters: this.props.defaultFilters }, () => {
        this.setFilters();
      });
    }, 300);
  };

  closeModal = () => {
    this.props.close();
  };

  render() {
    const {
      filterMapping,
      filterOptions,
      activeFilters,
    } = this.props;

    // set passed to Footer is applied to the apply button, set will only close the modal. Filters are set when an option is clicked
    return (
      <IonModal
        isOpen={this.props.isOpen}
        onDidDismiss={this.closeModal}
        backdropDismiss
        className={`components_ionic_filters_documentsFilter${this.props.roundedCorners ? ' rounded-corners' : ''} ${this.props.size}`}
      >
        <Components.ionic.filters.components.header title="Filters" />
        <IonContent className="modalBody ion-padding" scrollY={false}>
          {Object.keys(filterOptions).map((filter) => {
            return (
              <Components.ionic.filters.components.buttons title={filterMapping[filter]} options={filterOptions[filter]} value={activeFilters[filter]} keyValue={filter} set={this.setFilters} />
            );
          })}
        </IonContent>
        <Components.ionic.filters.components.footer reset={this.resetFilters} set={this.pressApply} />
      </IonModal>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_filters_documentsFilter);


