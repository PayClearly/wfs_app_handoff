// import { connect, Component, bindActionCreators, Fragment } from 'component';

// // Third Party Imports ...
// import download from 'downloadjs';

// // import Utils from 'utils';
// // import Store from 'store';
// import Selectors from 'selectors';
// // import Components from 'components';

// import './index.scss';

// const mapStateToProps = (state, props) => {
//   return ({
//     globalVendorGroups: state.global.groups.data.items,
//     globalVendors: state.global.vendors.data.items,
//     globalMetrics: Selectors.csrMetrics(state),
//   });
// };

// const mapDispatchToProps = (dispatch, props) => {
//   return ({});
// };

// class components_globalMetrics extends Component {
//   state = {};

//   componentDidMount() {}
//   componentWillUnmount() {}

//   convertToCSV = (objArray, hasHeaders) => {
//     const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
//     let str = '';
//     let headers;
//     if (hasHeaders) {
//       headers = array[0];
//     }

//     for (let i = 0; i < array.length; i += 1) {
//       let line = '';
//       if (i > 0 && hasHeaders) {
//         Object.keys(headers).forEach((key) => {
//           if (line !== '') line += ',';

//           line += Object.prototype.hasOwnProperty.call(array[i], [key]) ? array[i][key] : '';
//         });
//       } else {
//         Object.keys(array[i]).forEach((key) => {
//           if (line !== '') line += ',';
  
//           line += array[i][key];
//         });
//       }

//       str += `${line}\r\n`;
//     }

//     return str;
//   }

//   exportCSVFile = (headers, items, fileTitle) => {
//     if (headers) {
//       items.unshift(headers);
//     }

//     // Convert Object to JSON
//     const jsonObject = JSON.stringify(items);

//     const csv = this.convertToCSV(jsonObject, Boolean(headers));

//     const exportedFilename = `${fileTitle}.csv` || 'export.csv';

//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//     if (navigator.msSaveBlob) { // IE 10+
//       navigator.msSaveBlob(blob, exportedFilename);
//     } else {
//       download(blob, exportedFilename, 'text/csv');
//     }
//   }

//   render() {
//     const metrics = this.props.globalMetrics;
//     const exportDisabled = !Object.keys(this.props.globalVendorGroups).length;

//     return (
//       <div className="components_globalMetrics">
//         <div className="row">
//           <div className="col-xs-12 col-md-4">
//             <strong>Total Active Global Vendors</strong>
//             <br />
//             <p className="text-muted">{metrics.activeGlobalVendorCount}</p>
//           </div>
//           <div className="col-xs-12 col-md-4">
//             <strong>Total Active Groups</strong>
//             <br />
//             <small>(No Defaults)</small>
//             <br />
//             <p className="text-muted">{metrics.activeGroupNonDefaultCount}</p>
//           </div>
//           <div className="col-xs-12 col-md-4">
//             <strong>Total Group-linked Active Global Vendors</strong>
//             <br />
//             <small>(No Default Groups)</small>
//             <br />
//             <p className="text-muted">{metrics.totalGlobalVendorsLinkedToNonDefaultGroupsCount}</p>
//           </div>
//           <div className="col-xs-12 col-md-3">
//             <button 
//               onClick={() => { 
//                 this.exportCSVFile({ name: 'Vendor Name', vendorId: 'Vendor Id', globalVendorGroupId: 'Group Id', groupName: 'Group Name', tagName: 'Tag (Vertical)', vCard: 'Card', check: 'Check', ACH: 'ACH' }, metrics.exportData, 'globalDatabaseData'); 
//               }}
//               className={`btn btn-primary${exportDisabled ? ' disabled' : ''}`}
//               disabled={exportDisabled}
//             >
//               Export
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

// export default connect(mapStateToProps, mapDispatchToProps)(components_globalMetrics);

// // Internal Helper Functions ... 

// // GENERATOR_TYPE='component';
