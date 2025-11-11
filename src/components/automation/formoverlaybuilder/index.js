import { connect, Component, bindActionCreators, Fragment } from 'component';

import signature from 'assets/logos/clearly-form-signature.png';
import circle from 'assets/logos/form-circle.png';

// Third Party Imports ...


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_automation_formoverlaybuilder extends Component {
  state = {
    rects: [],
    currentRect: 0,
    rectsText: [],
  }

  componentDidMount() {
    // overwrite the delegate 
    this.props.delegate.formOverlayDelegate = () => {
      return this.state.rects;
    };

    let initialText = [];

    if (this.props.persistedRectangles && this.props.persistedRectangles.length) {
      initialText = new Array(this.props.persistedRectangles.length).fill('');
    }

    if (this.props.initialData && this.props.persistedRectangles && this.props.persistedRectangles.length) {
      this.props.persistedRectangles.forEach((rect, index) => {
        const field = rect.fieldName;

        initialText[index] = this.props.initialData[field] || '';
      });

    }

    const clonedPersistedRectangles = this.props.persistedRectangles.map((rectangle) => {
      return Object.assign({}, rectangle);
    });

    this.setState({ rectsText: initialText, rects: clonedPersistedRectangles || [], currentRect: clonedPersistedRectangles.length || 0 });
  }
  componentWillUnmount() {}

  handleMouseDown = (e) => {
    const pos = eventToPosition(e);

    this.setState((prevState) => {
      return { 
        rects: [...prevState.rects, { ...DEFAULT_RECT, x1: pos.x, y1: pos.y }],
        rectsText: [...prevState.rectsText, ''],
      };
    });
  }

  handleMouseUp = (e) => {
    const { rects, currentRect } = this.state;
    if (!rects.length || !rects[currentRect] || rects[currentRect].x1 === null) return;

    const pos = eventToPosition(e);
    if (rects[currentRect].move) {
      this.handleEndMove(e);
    } else if (pos.x === rects[currentRect].x1 || pos.y === rects[currentRect].y1) {
      this.setState((prevState) => {
        const rectsCopy = [...prevState.rects];
        rectsCopy.splice(currentRect, 1);

        const rectsTextCopy = [...prevState.rectsText];
        rectsTextCopy.splice(currentRect, 1);
        
        return {
          rects: rectsCopy,
          rectsText: rectsTextCopy,
        };
      });
    } else {
      this.setState((prevState) => {
        const rectsCopy = [...prevState.rects];
        const rect = rectsCopy[prevState.currentRect];

        rect.x2 = null;
        rect.y2 = null;
        rect.x3 = pos.x;
        rect.y3 = pos.y;

        return {
          currentRect: rectsCopy.length,
          rects: rectsCopy,
        };
      });
    }


  }
  
  handleMouseMove = (e) => {
    if (!this.state.rects.length || !this.state.rects[this.state.currentRect] || this.state.rects[this.state.currentRect].x1 === null) return;
    
    const pos = eventToPosition(e);
    if (this.state.rects[this.state.currentRect].move) {

      this.setState((prevState) => {
        const rectsCopy = [...prevState.rects];
        const rect = rectsCopy[prevState.currentRect];
        
        const diffX = pos.x - rect.move.startX;
        const diffY = pos.y - rect.move.startY;

        const hitXBoundary = rect.x1 + diffX < 0 || rect.x3 + diffX > 1;
        const hitYBoundary = rect.y1 + diffY < 0 || rect.y3 + diffY > 1;

        if (!hitXBoundary) {
          rect.move.startX = pos.x;
        }

        if (!hitYBoundary) {
          rect.move.startY = pos.y;
        }

        rect.x1 = hitXBoundary ? rect.x1 : rect.x1 + diffX;
        rect.y1 = hitYBoundary ? rect.y1 : rect.y1 + diffY;
  
        rect.x3 = hitXBoundary ? rect.x3 : rect.x3 + diffX;
        rect.y3 = hitYBoundary ? rect.y3 : rect.y3 + diffY;
  
        return {
          rects: rectsCopy,
        };
      });

    } else {

      this.setState((prevState) => {
        const rectsCopy = [...prevState.rects];
        rectsCopy[prevState.currentRect].x2 = pos.x;
        rectsCopy[prevState.currentRect].y2 = pos.y;
  
        return {
          rects: rectsCopy,
        };
      });

    }

  }

  handleTextInputChange = (value, index) => {
    this.setState((prevState) => {
      const rectsTextCopy = [...prevState.rectsText];
      rectsTextCopy[index] = value;

      return {
        rectsText: rectsTextCopy,
      };
    });
  }

  handleFieldChange = (value, index) => {
    this.setState((prevState) => {
      const rectsCopy = [...prevState.rects];
      rectsCopy[index].fieldName = value;

      const rectsTextCopy = [...prevState.rectsText];

      if (value === 'none') {
        rectsTextCopy[index] = '';

      } else if (this.props.initialData) {
        const textValue = this.props.initialData[value] || '';

        rectsTextCopy[index] = textValue || rectsTextCopy[index];
      }

      return {
        rects: rectsCopy,
        rectsText: rectsTextCopy,
      };
    });
  }

  handleDeleteTextField = (index) => {
    this.setState((prevState) => {
      const rectsCopy = [...prevState.rects];
      rectsCopy.splice(index, 1);

      const rectsTextCopy = [...prevState.rectsText];
      rectsTextCopy.splice(index, 1);

      return {
        rects: rectsCopy,
        currentRect: prevState.currentRect - 1,
        rectsText: rectsTextCopy,
      };
    });
  }

  handleStartResize = (index) => {
    this.setState((prevState) => {
      const rectsCopy = [...prevState.rects];
      rectsCopy[index].x3 = null;
      rectsCopy[index].y3 = null;

      return {
        currentRect: index,
        rects: rectsCopy,
      };
    });
  }

  handleStartMove = (e, index) => {
    const pos = eventToPosition(e);

    this.setState((prevState) => {
      const rectsCopy = [...prevState.rects];
      rectsCopy[index].move = {
        startX: pos.x,
        startY: pos.y,
      };

      return {
        currentRect: index,
        rects: rectsCopy,
      };
    });
  }

  handleEndMove = (e) => {
    if (!this.state.rects.length || !this.state.rects[this.state.currentRect] || !this.state.rects[this.state.currentRect].move) return null;

    const pos = eventToPosition(e);

    this.setState((prevState) => {
      const rectsCopy = [...prevState.rects];
      const rect = rectsCopy[prevState.currentRect];
      
      const diffX = pos.x - rect.move.startX;
      const diffY = pos.y - rect.move.startY;

      const hitXBoundary = rect.x1 + diffX < 0 || rect.x3 + diffX > 1;
      const hitYBoundary = rect.y1 + diffY < 0 || rect.y3 + diffY > 1;

      rect.x1 = hitXBoundary ? rect.x1 : rect.x1 + diffX;
      rect.y1 = hitYBoundary ? rect.y1 : rect.y1 + diffY;

      rect.x3 = hitXBoundary ? rect.x3 : rect.x3 + diffX;
      rect.y3 = hitYBoundary ? rect.y3 : rect.y3 + diffY;

      delete rect.move;

      return {
        currentRect: rectsCopy.length,
        rects: rectsCopy,
      };
    });
  }

  handleRef = (node) => {
    const rect = node.getBoundingClientRect();
    this.setState({ containerSize: { width: rect.width, height: rect.height } });
  }

  render() {
    return (
      <div className="components_automation_formoverlaybuilder">
        <div id="overlay-builder" style={{ height: `${this.props.height}px`, width: `${this.props.width}px`, zIndex: 2, position: 'relative' }} onMouseUp={this.handleMouseUp} onMouseDown={this.handleMouseDown} onMouseMove={this.handleMouseMove} >
          { this.state.rects.map((rect, index) => {
            if (!rect.x3 || rect.move) return null;

            const left = Math.min(rect.x1, rect.x3) * this.props.width;
            const top = Math.min(rect.y1, rect.y3) * this.props.height;
            const height = (Math.max(rect.y1, rect.y3) * this.props.height) - top;
            const width = (Math.max(rect.x1, rect.x3) * this.props.width) - left;

            return (
              <Fragment>
                {(() => {
                  if (rect.fieldName === 'signature') {
                    return (
                      <img 
                        src={signature}
                        alt="Pay Clearly"
                        id={`in-box-${index}`}
                        style={{
                          border: !this.props.hideControls ? '1px solid grey' : '1px solid transparent',
                          position: 'absolute',
                          top,
                          left,
                          height,
                          width,
                          zIndex: 3,
                        }}
                        onMouseDown={(e) => { 
                          e.stopPropagation();
                        }}
                      />
                    );
                  } else if (rect.fieldName === 'circle') {
                    return (
                      <img 
                        src={circle}
                        alt="Pay Clearly"
                        id={`in-box-${index}`}
                        style={{
                          border: !this.props.hideControls ? '1px solid grey' : '1px solid transparent',
                          position: 'absolute',
                          top,
                          left,
                          height,
                          width,
                          zIndex: 3,
                        }}
                        onMouseDown={(e) => { 
                          e.stopPropagation();
                        }}
                      />
                    );
                  }

                  return (
                    <input 
                      id={`in-box-${index}`}
                      style={{
                        border: !this.props.hideControls ? '1px solid grey' : '1px solid transparent',
                        position: 'absolute',
                        top,
                        left,
                        height,
                        width,
                        color: 'black',
                        fontSize: `${height / 1.4}px`,
                        lineHeight: `${height}px`,
                        fontFamily: 'Annie Use Your Telescope',
                        zIndex: 3,
                        backgroundColor: 'transparent',
                      }}  
                      onMouseDown={(e) => { 
                        e.stopPropagation();
                      }}
                      type="text"
                      onChange={(e) => { this.handleTextInputChange(e.target.value, index); }}
                      value={this.state.rectsText[index]}
                      required
                    />
                  );
                })()}
                <select 
                  onChange={(e) => { this.handleFieldChange(e.target.value, index); }}
                  style={{
                    display: this.props.hideControls && 'none',
                    position: 'absolute',
                    width: width * 0.33,
                    top,
                    left: left + (width * 0.6),
                    opacity: this.state.selectHovered === index ? 1 : 0.3,
                    zIndex: 4,
                  }}
                  onMouseEnter={() => {
                    this.setState({ selectHovered: index });
                  }}
                  onMouseLeave={() => {
                    this.setState({ selectHovered: null });
                  }}
                >
                  <optgroup label="general">
                    <option value="none" selected={rect.fieldName === 'none' || !rect.fieldName} >None</option>
                    <option value="signature" selected={rect.fieldName === 'signature'} >Signature</option>
                    <option value="todayDate" selected={rect.fieldName === 'todayDate'} >Today{"'"}s Date</option>
                    <option value="pcNumber" selected={rect.fieldName === 'pcNumber'} >PC Support Number</option>
                    <option value="pcEmail" selected={rect.fieldName === 'pcEmail'} >PC Support Email</option>
                    <option value="pcName" selected={rect.fieldName === 'pcName'} >PC Support Company Name</option>
                    <option value="checkbox" selected={rect.fieldName === 'checkbox'} >Checkbox</option>
                    <option value="circle" selected={rect.fieldName === 'circle'} >Circle</option>
                  </optgroup>
                  { this.props.fieldOptions && Object.keys(this.props.fieldOptions).map((option) => {
                    if (option === 'todayDate') return null;
                    return (
                      <optgroup label={option} >
                        { this.props.fieldOptions[option].map((subOption) => {
                          return <option value={subOption} selected={Boolean(rect.fieldName === subOption)} >{subOption.split(':')[1]}</option>;
                        })
                        }
                      </optgroup>
                    );
                  })}
                </select>
                <span
                  role="tooltip"
                  style={{
                    display: this.props.hideControls && 'none',
                    background: 'black',
                    position: 'absolute',
                    top: top + height - 5,
                    left: left + width - 5,
                    width: '5px',
                    height: '5px',
                    zIndex: 4,
                    cursor: 'nwse-resize',
                  }}
                  onMouseDown={(e) => { 
                    this.handleStartResize(index);
                    e.stopPropagation();
                  }}
                />
                <span
                  role="tooltip"
                  style={{
                    display: this.props.hideControls && 'none',
                    background: 'black',
                    position: 'absolute',
                    top,
                    left: left + width - 5,
                    width: '5px',
                    height: '5px',
                    zIndex: 4,
                    cursor: 'move',
                  }}
                  onMouseDown={(e) => { 
                    this.handleStartMove(e, index);
                    e.stopPropagation();
                  }}
                />
                <span 
                  role="tooltip"
                  style={{
                    display: this.props.hideControls && 'none',
                    position: 'absolute',
                    top,
                    left: left - 15,
                    zIndex: 4,
                    cursor: 'pointer',
                  }}
                  onClick={(e) => { 
                    this.handleDeleteTextField(index);
                    e.stopPropagation();
                  }}
                >
                  <i className="mdi mdi-close text-danger" />
                </span>
              </Fragment>
            );
          })}
          {(() => {
            if (this.state.rects.length && this.state.rects[this.state.currentRect] && this.state.rects[this.state.currentRect].x2) {
              const rect = this.state.rects[this.state.currentRect];
              const left = Math.min(rect.x1, rect.x2) * this.props.width;
              const top = Math.min(rect.y1, rect.y2) * this.props.height;
              const height = (Math.max(rect.y1, rect.y2) * this.props.height) - top;
              const width = (Math.max(rect.x1, rect.x2) * this.props.width) - left;

              return (
                <div
                  style={{
                    border: '1px dashed grey',
                    position: 'absolute',
                    top,
                    left,
                    height,
                    width,
                    zIndex: 3,
                  }}
                />
              );
            } else if (this.state.rects.length && this.state.rects[this.state.currentRect] && this.state.rects[this.state.currentRect].move) {
              const rect = this.state.rects[this.state.currentRect];
              const left = Math.min(rect.x1, rect.x3) * this.props.width;
              const top = Math.min(rect.y1, rect.y3) * this.props.height;
              const height = (Math.max(rect.y1, rect.y3) * this.props.height) - top;
              const width = (Math.max(rect.x1, rect.x3) * this.props.width) - left;

              return (
                <div
                  style={{
                    border: '1px dashed grey',
                    position: 'absolute',
                    top,
                    left,
                    height,
                    width,
                    zIndex: 3,
                  }}
                />
              );
            }
          })()}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_automation_formoverlaybuilder);

// Internal Helper Functions ... 
const DEFAULT_RECT = {
  x1: null,
  x2: null,
  y1: null,
  y2: null,
  x3: null,
  y3: null,
  fieldName: 'none',
};

function eventToPosition(e) {
  const clientX = e.clientX;
  const clientY = e.clientY;

  const myElement = document.querySelector('#overlay-builder'); 
  const elementPositions = myElement.getBoundingClientRect();

  const x = clientX - elementPositions.x;
  const y = clientY - elementPositions.y;
  const containerWidth = elementPositions.width;
  const containerHeight = elementPositions.height;
  const percentageX = x / containerWidth;
  const percentageY = y / containerHeight;

  return { x: percentageX, y: percentageY };
}

