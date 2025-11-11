import numeral from 'numeral';

export function FormatRef(refNumber) {
  return `P_${refNumber}`;
}

export function FormatAmount(amount) {
  return (amount) ? numeral(amount).format('$0,0.00') : null;
}
