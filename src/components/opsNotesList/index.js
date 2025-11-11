import { connect, Component } from 'component';

// import Utils from 'utils';
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

class components_opsNotesList extends Component {
  state = {}




  _sortNotes = (noteA, noteB) => {
    const noteADate = noteA._createdAt;
    const noteBDate = noteB._createdAt;

    if (noteADate < noteBDate) return -1;
    if (noteBDate > noteADate) return 1;
    return 0;
  };

  render() {
    const { notes = [] } = this.props;
    if (!notes.length) return null;
    const sortedNotes = notes.sort(this._sortNotes);

    return (
      <div className="components-opsNotesList">
        <ul className="list-unstyled">
          { // Have a transition between all and one ?? It just pops open as of now
            this.props.showAll ?
              sortedNotes.map((note, index) => {
                return <Components.opsNote key={note._id} note={note} notFirst={index !== 0} />;
              })
              :
              <Components.opsNote key={sortedNotes.slice(-1)[0]} note={sortedNotes.slice(-1)[0]} />
          }
        </ul>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_opsNotesList);


