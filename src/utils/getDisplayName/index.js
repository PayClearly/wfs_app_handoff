// Third Party Imports ...


function utils_getDisplayName(user) {
  if (user.firstName) {
    return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
  }

  if (user.username) {
    return user.username;
  }

  return user.email;
}

export default utils_getDisplayName;


