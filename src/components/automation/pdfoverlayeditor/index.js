import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import JsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import md5 from 'md5';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

// Internal Helper Functions ...
const PARAMS = {
  resolutionWidth: 1080,
  widthToHeight: 1.2941,
};

window.resolutionFactor = 1.2941;

const mapStateToProps = (state, props) => {
  return ({
    prefills: state.global.prefills,
    files: state.global.attachments.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    setPrefillRects: (id, data) => {
      return dispatch(Store.global.updateFormPrefill(id, data));
    },
  });
};

class components_automation_pdfoverlayeditor extends Component {
  state = {
    height: 0,
    width: 0,
    rotate: null,
    portrait: true,
    computeWidthInterval: null,
    preppingForDownload: false,
    pdfLoaded: false,
    filename: '',
  }

  componentDidMount() {
    const { initialData } = this.props;
    const filename = `${(initialData && (initialData['Payer Information:Account Name'] && initialData['Payment Information:Vendor Name'] && initialData.todayDate)) ? `${initialData['Payer Information:Account Name']}_${initialData['Payment Information:Vendor Name']}_${initialData.todayDate}` : `form_${Date.now()}.pdf`}`;

    this.setState({
      filename,
      computeWidthInterval: setInterval(() => { this.computeWidth(this.props); }, 2000),
    });
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    if (!this.state.attachmentId && props.attachment.md5Hash) {
      this.setState({
        attachmentId: md5(props.attachment.md5Hash),
      });
    }

    const rotation = (props.prefills.data.items[this.state.attachmentId] && props.prefills.data.items[this.state.attachmentId].rotation) || 0;
    if (this.state.attachmentId && props.prefills.status.fetched && this.state.rotate === null) {
      const portrait = !(rotation === 90 || rotation === 270);
      this.setState({
        rotate: rotation,
        portrait,
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.computeWidthInterval);
  }

  delegates = {}

  rotate90 = () => {
    const rotate = ((this.state.rotate) + 90) % 360;
    const portrait = !(rotate === 90 || rotate === 270);
    this.setState({
      rotate: ((this.state.rotate) + 90) % 360,
      portrait,
    });
  }

  downloadAsPDF() {
    this.setState({
      preppingForDownload: true,
    });
    return this.createAndBuildDocument()
      .then((doc) => {
        return doc.save(this.state.filename);
      })
      .then(() => {
        this.setState({
          preppingForDownload: false,
        });
      });
  }

  lockPaymentForm = () => {
    this.setState({
      preppingForDownload: true,
    });
    return this.createAndBuildDocument()
      .then((doc) => {
        const saved = doc.output('blob');
        // doc.output support for filenames doesnt work properly, so to get remittance file name to save correctly I have to output to blob and then build a File object with the desired name
        const namedFile = new File([saved], this.state.filename, { type: saved.type, lastModified: saved.lastModified });
        this.props.loadPDF(namedFile);
      });
  }

  createAndBuildDocument = () => {
    return new Promise((resolve, reject) => {
      const doc = new JsPDF('p', 'pt', [PARAMS.resolutionWidth, (PARAMS.resolutionWidth * PARAMS.widthToHeight)]);
      const under = _cloneCanvas(document.querySelector('#pdf-canvas-container').firstChild.firstChild);
      const canvasWidth = PARAMS.resolutionWidth * window.resolutionFactor;

      return new Promise((_res) => {
        setTimeout(_res, 1500);
      })
        .then(() => {

          const overHTML = document.querySelector('#overlay-builder');
          overHTML.style.width = this.state.portrait && `${canvasWidth}px` || `${canvasWidth * PARAMS.widthToHeight}px`;
          overHTML.style.height = this.state.portrait && `${canvasWidth * PARAMS.widthToHeight}px` || `${canvasWidth}px`;

          return html2canvas(overHTML, {
            backgroundColor: null,
            scale: 1,
          });
        })
        .then((over) => {
          const rotatedOver = document.createElement('canvas');
          rotatedOver.width = canvasWidth;
          rotatedOver.height = canvasWidth * PARAMS.widthToHeight;
          const rotatedOverContext = rotatedOver.getContext('2d');

          // compute translation
          const translateBy = _properlyTransLataveOver(this.state.rotate, canvasWidth);
          rotatedOverContext.translate(translateBy.x, translateBy.y);
          rotatedOverContext.rotate(-(this.state.rotate) * Math.PI / 180);
          rotatedOverContext.drawImage(over, 0, 0);

          const full = document.createElement('canvas');
          full.width = canvasWidth;
          full.height = canvasWidth * PARAMS.widthToHeight;

          const fullContext = full.getContext('2d');

          fullContext.drawImage(under, 0, 0);
          fullContext.drawImage(rotatedOver, 0, 0);

          doc.addImage(full, 0, 0);
          resolve(doc);
        });
    });
  }

  savePrefill = () => {
    if (this.props.prefills.status.updating) {
      return;
    }
    this.props.setPrefillRects(this.state.attachmentId, {
      rotation: this.state.rotate,
      fields: this.delegates.formOverlayDelegate(),
    });
  }

  computeWidth() {
    if (!document) return;

    const myElement = document.querySelector('#overlaybuildercontainer');
    const elementPositions = myElement.getBoundingClientRect();
    const width = elementPositions.width;
    if (width && width !== this.state.width) {
      this.setState({
        width,
      });
    }

  }

  render() {

    const isReady = this.props.prefills.status.fetched;
    const initialPrefillData = this.props.prefills.data.items[this.state.attachmentId] && this.props.prefills.data.items[this.state.attachmentId].fields || [];

    const width = PARAMS.resolutionWidth * window.resolutionFactor;
    const height = width * PARAMS.widthToHeight;

    const paddingFactor = ((height - width) / 2);
    const paddingTopBottom = this.state.portrait ? 0 : paddingFactor;
    const paddingLeftRight = this.state.portrait ? paddingFactor : 0;

    const zoomFactor = (this.state.preppingForDownload && 1) || this.state.width / height;

    const pdf = this.props.files[this.props.attachment.md5Hash];

    return (
      <Fragment>
        <div style={{ position: 'relative', background: 'black' }} className="w-100 h-100 components_automation_pdfoverlayeditor" id="overlaybuildercontainer">
          {!(this.state.preppingForDownload || !pdf) &&
            <Fragment>
              <button style={{ position: 'absolute', top: 10, right: 10, zIndex: 5 }} className="btn btn-lg btn-info" onClick={this.rotate90} ><i className="mdi mdi-rotate-right-variant" /></button>
              {/* <button style={{ position: 'absolute', top: 76, right: 10, zIndex: 5 }} className="btn btn-lg btn-primary" onClick={() => { this.downloadAsPDF(); }} ><i className="mdi mdi-download" /></button> */}
              <button style={{ position: 'absolute', top: 76, left: 10, zIndex: 5 }} className="btn btn-lg btn-primary" onClick={this.lockPaymentForm} ><i className="mdi mdi-lock" /></button>
              <button style={{ position: 'absolute', top: 10, left: 10, zIndex: 5 }} className="btn btn-lg btn-secondary" onClick={this.savePrefill} >
                <span className={`${this.props.prefills.status.updating && 'd-inline-block animated rotateIn infinite'}`}>
                  <i className="mdi mdi-content-save-outline" />
                </span>
              </button>
            </Fragment>
          }

          <div style={{ width: `${this.state.width}px`, height: `${this.state.width}px`, overflow: 'hidden' }} >
            {(this.state.preppingForDownload || !pdf) &&
              <div style={{ zIndex: 20, position: 'absolute', background: 'grey', width: `${this.state.width}px`, height: `${this.state.width}px`, top: '0px', left: '0px' }} >
                <span className="d-inline-block animated rotateIn infinite ms-3 me-3">
                  <i style={{ fontSize: '50px' }} className="mdi mdi-update" />
                </span>
              </div>
            }

            {isReady && this.state.rotate !== null &&
              <Fragment>
                <div style={{ position: (!this.state.preppingForDownload && 'absolute') || '', top: `${paddingTopBottom * zoomFactor}px`, left: `${paddingLeftRight * zoomFactor}px` }} >
                  <Components.automation.formoverlaybuilder
                    height={(this.state.portrait && height || width) * zoomFactor}
                    width={(this.state.portrait && width || height) * zoomFactor}
                    hideControls={this.state.preppingForDownload}
                    fieldOptions={this.props.fieldOptions}
                    initialData={this.props.initialData}
                    delegate={this.delegates}
                    persistedRectangles={initialPrefillData}
                  />
                </div>

                <div style={{ zoom: `${zoomFactor * 100}%`, width: `${height}px`, height: `${height}px`, padding: `${paddingTopBottom}px ${paddingLeftRight}px ${paddingTopBottom}px ${paddingLeftRight}px` }} >
                  <div id="pdf-canvas-container" style={{ background: 'white', width: `${width}px`, height: `${height}px`, transform: `rotate(${this.state.rotate}deg)`, 'transform-origin': 'left top', position: 'relative', ..._positionFromHeightAngle(this.state.rotate, width) }} >
                    <Components.containers.pdf
                      pdf={this.props.attachment}
                    />
                  </div>
                </div>
              </Fragment>
            }
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_automation_pdfoverlayeditor);

function _positionFromHeightAngle(angle, width) {
  switch (angle) {
    case 90:
      return {
        left: `${width * (11 / 8.5)}px`,
      };
    case 180:
      return {
        left: `${width}px`,
        top: `${width * (11 / 8.5)}px`,
      };
    case 270:
      return {
        top: `${width}px`,
      };
    default:
      return {};
  }
}

function _properlyTransLataveOver(angle, width) {
  switch (angle) {
    case 90:
      return {
        x: 0,
        y: width * (11 / 8.5),
      };
    case 180:
      return {
        x: width,
        y: width * (11 / 8.5),
      };
    case 270:
      return {
        x: width,
        y: 0,
      };
    default:
      return {};
  }
}

function _cloneCanvas(oldCanvas) {
  const newCanvas = document.createElement('canvas');
  const context = newCanvas.getContext('2d');

  const desiredWidth = PARAMS.widthToHeight * PARAMS.resolutionWidth;
  const scaleToFactor = desiredWidth / oldCanvas.width;

  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;

  context.drawImage(oldCanvas, 0, 0, oldCanvas.width * scaleToFactor, oldCanvas.height * scaleToFactor);

  return newCanvas;
}

// GENERATOR_TYPE='component';
