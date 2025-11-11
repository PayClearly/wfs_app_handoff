// Third Party Imports ...

import Utils from 'utils';

function utils_calculateCommission(baseAmount = 0, rate = 0, commissionOffsetPercentage = 0) {
  const nonRoundedAmount = Number(parseFloat((baseAmount / (Utils.addDollars([100, -commissionOffsetPercentage]) / 100) * (rate / 100))));
  const roundedAmount = Math.ceil(nonRoundedAmount * 100) / 100;
  return roundedAmount;
}

export default utils_calculateCommission;


