import { connect, Component } from 'component';
import { IonFab, IonFabButton, IonFabList, IonIcon } from '@ionic/react';
import { receipt, airplane, camera, documents, add } from 'ionicons/icons';
import { createRef } from 'react';

import Store from 'store';

import './index.scss';

const mapStateToProps = (state, props) => ({
  modals: state.router.modals,
  context: state.wfs.data.context,
});

const mapDispatchToProps = (dispatch, props) => ({
  navigate: (name, params = {}) => {
    dispatch(Store.router.navigateTo(name, params));
  },
  openExpenseModal: () => {
    dispatch(Store.router.openModal('Components.ionic.modals.expense'));
  },
  openReportModal: () => {
    dispatch(Store.router.openModal('Components.ionic.modals.report'));
  },
  openAdhocTripModal: () => {
    dispatch(Store.router.openModal('Components.ionic.modals.tripAdhoc'));
  },
  openExpenseReceiptFirstModal: () => {
    dispatch(Store.router.openModal('Components.ionic.modals.expense', { receiptFirst: true }));
  },
});

const mapResourcesToProps = (state, props) => ({});

class components_ionic_fab extends Component {
  fabRef = createRef();

  state = {
    showPopover: false,
  };

  componentDidMount() { }

  componentWillUnmount() { }

  createNavigate = (key) => {
    this.toggleFab();
    switch (key) {
      case 'openExpenseModal':
        this.props.openExpenseModal();
        break;
      case 'openReportModal':
        this.props.openReportModal();
        break;
      case 'openAdhocTripModal':
        this.props.openAdhocTripModal();
        break;
      case 'openReceiptFirstExpense':
        this.props.openExpenseReceiptFirstModal();
        break;
      default:
        break;
    }
  };

  toggleFab = () => {
    const prevState = this.state.showPopover;
    this.setState({ showPopover: !prevState });
    if (prevState) {
      this.fabRef.current.close();
    }
  };

  render() {
    const createOptions = [
      { icon: documents, label: 'Expense Report', handler: 'openReportModal' },
      { icon: receipt, label: 'Expense', handler: 'openExpenseModal' },
      { icon: camera, label: 'Receipt', handler: 'openReceiptFirstExpense' },
      { icon: airplane, label: 'Trip', handler: 'openAdhocTripModal' },
    ];
    const { hidden, context, modals, small } = this.props;
    const hasContext = context.tailNumber && context.customerNumber;
    const showFAB = !hidden && hasContext;

    return (
      <>
        <div
          className={`fab-backdrop${this.state.showPopover ? ' show' : ' hide'}`}
          slot="fixed"
        />

        <div
          className={`fab-overlay${this.state.showPopover ? ' show' : ' hide'}`}
          slot="fixed"
          onClick={this.toggleFab}
        />

        <IonFab
          className={`${showFAB ? 'show' : 'hide'}${modals.length > 0 || small ? ' small' : ''}`}
          vertical="bottom"
          horizontal="end"
          slot="fixed"
          ref={this.fabRef}
        >
          <IonFabButton onClick={this.toggleFab}>
            <IonIcon icon={add} />
          </IonFabButton>
          <IonFabList side="top">
            {
              createOptions.map(({ icon, label, handler }) => (
                <IonFabButton key={label} onClick={() => this.createNavigate(handler)} data-desc={label}>
                  <IonIcon icon={icon} />
                </IonFabButton>
              ))
            }
          </IonFabList>
        </IonFab>

      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_fab);


