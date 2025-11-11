import { connect, Component } from 'component';
import {
  IonSegment,
  IonLabel,
  IonSegmentButton,
  IonList,
  IonListHeader,
  IonHeader,
  IonButton,
  IonIcon,
  IonItem,
  IonCheckbox,
  IonModal,
  IonContent,
} from '@ionic/react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { downloadOutline } from 'ionicons/icons';
import { Parser } from 'json2csv';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@ionic-native/file-opener';
import { Share } from '@capacitor/share';
import { Device } from '@capacitor/device';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const expenseFieldsToExport = [
  'date',
  'amount',
  'currency',
  'vendor',
  'personal',
  'reimbursable',
];

const booleanMap = {
  true: 'Yes',
  false: 'No',
};

const expenseToFieldsMap = {
    amount: 'Amount',
    date: 'Date',
    currency: 'Currency',
    vendor: 'Vendor',
    personal: 'Personal',
    reimbursable: 'Reimbursable',
};

const _categorizeExpenses = (expenses, selectedExpenses, { selectingExpenses = false, setSelectedExpense = () => {} }) => {
  const unassigned = [];
  const assigned = [];
  const componentize = (items) => items.filter((expense) => !expense.deleted).map((expense, index, arr) => {
    if (selectingExpenses) {
      return (
        <IonItem lines={index === arr.length - 1 ? 'none' : 'full'}>
          <IonCheckbox slot="start" checked={selectedExpenses[expense._id]} onIonChange={(e) => setSelectedExpense(e.detail.checked, expense._id)} />
          <Components.ionic.expense data={expense} lastItem />
        </IonItem>
      );
    }
    return <Components.ionic.expense data={expense} lastItem={index === arr.length - 1} />;
  });
  Object.values(expenses).forEach((expense) => {
    if (expense.reportId) { assigned.push(expense); } else { unassigned.push(expense); }
  });
  return [componentize(unassigned), componentize(assigned)];
};

const downloadCSV = async (expenses, fileName, { callback = false, toastShow = () => {} }) => {
  try {
    const parser = new Parser({ formatters: {} });
    const csv = parser.parse(expenses);
    const res = await Filesystem.writeFile({
      path: fileName,
      data: csv,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    const deviceInfo = await Device.getInfo();

    if (deviceInfo.platform === 'android') {
      await Share.share({
        title: fileName,
        text: 'Here are some exported expenses from myWorld Wallet',
        dialogTitle: 'Share with others',
        url: res.uri,
      });
      Filesystem.deleteFile({
        path: fileName,
        directory: Directory.Cache,
      });
    } else {
      FileOpener.open(res.uri, 'text/csv', {
        success: () => {
          Filesystem.deleteFile({
            path: fileName,
            directory: Directory.Cache,
          });
          if (callback) { callback(); }
        },
        error: () => {
          Filesystem.deleteFile({
            path: fileName,
            directory: Directory.Cache,
          });
          if (callback) { callback(); }
        },
      });
    }


  } catch (err) {
    if (callback) { callback(); }
    toastShow('Something unexpected happened.', 'primary', 5000);
  }
};

const formatExpenseForExport = (expense) => {
  const formattedExpense = expenseFieldsToExport.reduce((acc, expenseField) => {
    const formatted = acc;
    let formattedValue;
    if (!expense[expenseField]) {
      formattedValue = '-';
    } else {
      switch (expenseField) {
        case 'amount':
          formattedValue = `$${parseFloat(expense[expenseField]).toFixed(2)}`;
          break;
        case 'personal':
        case 'reimbursable':
          formattedValue = booleanMap[expense[expenseField]];
          break;
        case 'date':
          formattedValue = Utils.dates.dateToDay(expense[expenseField], 'dateSlashFormatUS');
          break;
        default:
          formattedValue = expense[expenseField];
          break;
      }
    }
    formatted[expenseToFieldsMap[expenseField]] = formattedValue;
    return formatted;
  }, {});
  return formattedExpense;
};

// END Interal Helpers

const mapStateToProps = (state) => ({
    expenses: Selectors.expenses(state).expenses,
    reports: Selectors.expenses(state).availableExpenseReports,
    activeReports: Selectors.expenses(state).activeExpenseReports,
    approvedReports: Selectors.expenses(state).approvedExpenseReports,
    closedReports: Selectors.expenses(state).closedExpenseReports,
    wfsContext: _resolve(state.wfs, 'data.context', {}),
    accountContext: _resolve(state.account, 'data.id', ''),
  });

const mapDispatchToProps = (dispatch) => ({
    showToast: (message, color = 'primary', duration = 1000) => {
      Store.device.showToast({ message, duration, color })(dispatch);
    },
  });

class componentsRoutesExpenses extends Component {

  state = {
    show: 'expenses',
    selectingExpenses: false,
    createExportIsOpen: false,
    selectedExpenses: {},
    exportingReports: {},
  };

  componentDidMount() {}

  componentWillUnmount() {}

  onSegmentChange = (e) => {
    this.setState({ show: e.detail.value });
  };

  onExpenseCheckBox = (value, id) => {
    this.setState((prevState) => {
      const selected = prevState.selectedExpenses;
      if (value) { selected[id] = value; } else { delete selected[id]; }
      return {
        ...prevState,
        selectedExpenses: selected,
      };
    });
  };

  onReportExport = (e, report) => {
    e.stopPropagation();
    this.setReportExporting(true, report._id);
    const expenseIds = Object.keys(report.expenseIds);
    const reportData = Object.values(this.props.expenses).map((val) => {
      if (!expenseIds.includes(val._id)) { return; }
      const formatted = formatExpenseForExport(val);
      return formatted;
    }).filter((hasValue) => !!hasValue);
    downloadCSV(
      reportData,
      `${report.name.replace(/([ |/])/gi, '-')}-${Utils.dates.dateToDay(new Date(), 'dateFormatUS')}.csv`,
      { callback: () => this.setReportExporting(false, report._id), toastShow: this.props.showToast }
    );
  };

  setReportExporting = (value, id) => {
    this.setState((prevState) => {
      const selected = prevState.exportingReports;
      if (value) { selected[id] = value; } else { delete selected[id]; }
      return {
        ...prevState,
        exportingReports: selected,
      };
    });
  };

  render() {
    let activeExpenseCount = 0;
    const selectedExpenseCount = Object.keys(this.state.selectedExpenses).length;
    const activeExpenses = Object.values(this.props.expenses).reduce((acc, expense) => {
      if (expense.deleted) { return acc; }
      activeExpenseCount += 1;
      const returnAcc = acc;
      returnAcc[expense._id] = expense;
      return returnAcc;
    }, {});
    const [unassignedItems, assignedItems] = _categorizeExpenses(activeExpenses, this.state.selectedExpenses, { selectingExpenses: this.state.selectingExpenses, setSelectedExpense: this.onExpenseCheckBox });

    return (
      <div className="components_routes_expenses">
        <IonHeader>
          <IonSegment value={this.state.show} onIonChange={this.onSegmentChange}>
            <IonSegmentButton value="expenses">
              <IonLabel>Expenses</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="reports">
              <IonLabel>Reports</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonHeader>
        <IonModal
          isOpen={this.state.selectingExpenses}
          backdropDismiss={false}
          className="export-modal rounded-corners"
          showBackdrop={false}
        >
          <IonContent scrollY={false}>
            <IonItem
              className="export-actions ion-justify-content-space-between ion-align-content-center"
              lines="none"
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <IonButton
                  color="danger"
                  size="large"
                  onClick={() => {
                    this.props.toggleFAB({ hidden: false });
                    this.setState({ selectingExpenses: false, selectedExpenses: {} });
                  }}
                >
                  Cancel
                </IonButton>
                <IonButton
                  size="large"
                  disabled={selectedExpenseCount === 0}
                  onClick={() => {
                    this.props.toggleFAB({ hidden: false });
                    const expenseIds = Object.keys(this.state.selectedExpenses);
                    const expenseData = Object.values(activeExpenses).map((val) => {
                      if (!expenseIds.includes(val._id)) { return; }
                      const formatted = formatExpenseForExport(val);
                      return formatted;
                    }).filter((hasValue) => !!hasValue);
                    this.setState({ selectingExpenses: false, selectedExpenses: {} });
                    downloadCSV(
                      expenseData,
                      `Expense-Export-${Utils.dates.dateToDay(new Date(), 'dateFormatUS')}.csv`,
                      { toastShow: this.props.showToast }
                    );
                  }}
                >
                  Export
                </IonButton>
              </div>
            </IonItem>
          </IonContent>

        </IonModal>
        <SwitchTransition mode="out-in">
          <CSSTransition
            classNames="expenses-route-transitioner"
            timeout={100}
            key={this.state.show}
          >
            <div className={`list-container ${this.props.wfsContext.tailNumber && 'background-fill'}`} key={this.state.show}>
              {!this.props.wfsContext.tailNumber && (
                <div>
                  <p style={{ textAlign: 'center' }}>Please select a tail</p>
                </div>
              )}
              { this.state.show === 'expenses' && this.props.wfsContext.tailNumber && (
                <>
                  <IonList>
                    <IonListHeader>
                      {
                        this.state.selectingExpenses
                        && (
                          <IonItem
                            className="group-action ion-justify-content-center ion-align-content-center"
                            lines="none"
                            style={{ width: '100%', height: '100%', display: 'flex' }}
                          >
                            <IonButton
                              color="danger"
                              size="small"
                              fill="outline"
                              disabled={selectedExpenseCount === 0}
                              onClick={() => {
                                this.setState({ selectedExpenses: {} });
                              }}
                            >
                              Clear All
                            </IonButton>
                            <IonLabel style={{ textAlign: 'center' }}>
                              {`${selectedExpenseCount} / ${activeExpenseCount} selected`}
                            </IonLabel>
                            <IonButton
                              size="small"
                              fill="outline"
                              disabled={selectedExpenseCount === activeExpenseCount}
                              onClick={() => {
                                const expenseIds = Object.values(activeExpenses).reduce((acc, value) => {
                                  acc[value._id] = true;
                                  return acc;
                                }, {});
                                this.setState({ selectedExpenses: expenseIds });
                              }}
                            >
                              Select All
                            </IonButton>
                          </IonItem>
                        )
                      }
                      <IonItem lines="none" style={{ marginRight: 'calc(var(--ion-safe-area-left, 0px) + 20px)', width: '100%' }}>
                        <span slot="start">UNASSIGNED</span>
                        <IonButton
                          slot="end"
                          disabled={this.state.selectingExpenses}
                          onClick={() => {
                            this.props.toggleFAB({ hidden: true });
                            this.setState({ selectingExpenses: true });
                            }}
                        >
                          <IonIcon icon={downloadOutline} />
                        </IonButton>
                      </IonItem>
                    </IonListHeader>
                    {unassignedItems}
                  </IonList>
                  <IonList>
                    <IonListHeader>
                      <IonItem lines="none" style={{ width: '100%' }}>
                        <span slot="start">ASSIGNED</span>
                      </IonItem>
                    </IonListHeader>
                    {assignedItems}
                  </IonList>
                </>
              )}
              { this.state.show === 'reports' && this.props.wfsContext.tailNumber && (
                <>
                  <IonList>
                    <IonListHeader>
                      <IonItem lines="none" style={{ width: '100%' }}>
                        <span slot="start">ACTIVE REPORTS</span>
                      </IonItem>
                    </IonListHeader>
                    {this.props.activeReports.filter((report) => !report.deleted).map((report, index, arr) => (
                      <Components.ionic.report
                        data={report}
                        lastItem={index === arr.length - 1}
                        exporting={this.state.exportingReports[report._id] || false}
                        download={(e) => {
                          this.onReportExport(e, report);
                        }}
                      />
                    ))}
                  </IonList>
                  <IonList>
                    <IonListHeader>
                      <IonItem lines="none" style={{ width: '100%' }}>
                        <span slot="start">CLOSED REPORTS</span>
                      </IonItem>
                    </IonListHeader>
                    {this.props.closedReports.map((report, index, arr) => (
                      <Components.ionic.report
                        data={report}
                        lastItem={index === arr.length - 1}
                        exporting={this.state.exportingReports[report._id] || false}
                        download={(e) => {
                          this.onReportExport(e, report);
                        }}
                      />
                    ))}
                  </IonList>
                </>
              )}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsRoutesExpenses);
