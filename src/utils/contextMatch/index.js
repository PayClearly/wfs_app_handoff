// Third Party Imports ...

function utils_contextMatch(context1, context2) {
  if (context1.organizationId !== context2.organizationId) return false;
  if (context1.accountId !== context2.accountId) return false;
  return true;
}

export default utils_contextMatch;

