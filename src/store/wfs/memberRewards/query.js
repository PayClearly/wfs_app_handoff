const { MemberRewards } = require('../schemas');

const query = `
  query memberRewards($memberNumber: Int) {
    memberRewards(memberNumber: $memberNumber) ${MemberRewards}
  }
`;

module.exports = query;
