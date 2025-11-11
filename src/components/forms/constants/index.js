// PC-3495 Management team decided to set default maxUses for Galileo to 5 for all payments.
const providerDefaultVCardMaxUses = {
  GALILEO: 5,
  EFS: 1,
  STUB: 1,
  GALILEOSTUB: 5,
};

module.exports = {
  providerDefaultVCardMaxUses,
};
