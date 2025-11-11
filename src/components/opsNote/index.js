import { connect, Component } from 'component';

import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    opsNotes: state.account.opsNotes.data.items,
    users: state.users.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_opsNote extends Component {




  render() {
    const { note, users } = this.props;
    let userName = '';
    if (_try(() => users[note._createdBy].firstName)) {
      userName = users[note._createdBy].firstName;
      if (_try(() => users[note._createdBy].lastName)) userName = `${userName} ${users[note._createdBy].lastName}`;
    } else if (_try(() => users[note._createdBy].lastName)) {
      userName = users[note._createdBy].lastName;
    } else if (_try(() => users[note._createdBy].username)) {
      userName = _try(() => users[note._createdBy].username, '');
    } else {
      userName = _try(() => users[note._createdBy].email, 'Anonymous');
    }

    const { typeText, color } = getTypeValues(note);

    return (
      <li className={`components_opsNote media${this.props.notFirst ? ' mt-2' : ''}`}>
        <div>
          <div className="d-flex align-items-center mt-0 mb-0">
            <h5 className="mb-0 me-2">{userName}</h5>
            <small>{Utils.dates.dateToDay(note._createdAt)}</small>
          </div>
          <div className="d-flex align-items-center pt-1">
            <Components.badges.noteType text={typeText} color={color} />
            {note.message}
          </div>
        </div>
      </li>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_opsNote);

// Internal Helper Functions ...

function getTypeValues(opsNote) {
  let color;
  let typeText;
  switch (opsNote.type) {
    case 'Exception':
      color = 'warning';
      typeText = opsNote.type;
      break;
    case 'Issue':
      color = 'danger';
      typeText = opsNote.type;
      break;
    case 'General':
    default:
      color = 'primary';
      typeText = opsNote.type;
      break;
  }
  return { typeText, color };
}

// GENERATOR_TYPE='component';
