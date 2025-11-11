import { connect, Component, bindActionCreators, Fragment } from 'component';
import { Droppable, Draggable } from 'react-beautiful-dnd';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',

  // change background colour if dragging
  // background: isDragging ? 'lightgreen' : 'none',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'none',
  display: 'flex',
  overflow: 'auto',
});

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tables_components_header extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { draggableId, index, text, orderBy } = this.props;

    return (
      <Droppable droppableId={index} direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
            {...provided.droppableProps}
          >
            <Draggable key={draggableId} draggableId={draggableId} index={0}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={getItemStyle(
                    snapshot.isDragging,
                    provided.draggableProps.style,
                  )}
                >
                  {text}
                  {orderBy === 'asc' && <Fragment>&nbsp;<i className={'mdi mdi-chevron-up'} /></Fragment>}
                  {orderBy === 'desc' && <Fragment>&nbsp;<i className={'mdi mdi-chevron-down'} /></Fragment>}
                </div>
              )}
            </Draggable>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_components_header);


