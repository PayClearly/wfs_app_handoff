import {
  connect,
  Component,
} from 'component';

import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  users: state.users.data.items,
});

const mapDispatchToProps = () => ({});

class components_badges_createdby extends Component {
  render() {
    const { users, default: defaultUser, showUsername = false } = this.props;

    let { user } = this.props;

    if (typeof user === 'string') {
      user = _try(() => users[user]);
    }

    if (!user) {
      return defaultUser || 'Admin User';
    }

    let description;

    if (user.firstName && user.lastName) {
      description = `${user.firstName} ${user.lastName}`;
    } else if (user.email) {
      description = user.email;
    }


    return (
      <div className="d-flex flex-row">
        <Components.tooltip>
          <Components.avatar user={user} />
          {
            !showUsername ? <span>{description}</span> : null
          }
        </Components.tooltip>
        {
          showUsername ? <span>{description}</span> : null
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_badges_createdby);


