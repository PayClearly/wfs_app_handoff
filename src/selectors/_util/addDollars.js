export default function addDollars(amounts = []) {
  let amount = 0;
  amounts
  .forEach((val) => {
    const value = _try(() => ((typeof val === 'number') ? val : Number(val.toFixed(2))), 0);
    amount += Math.round(value * 100);
  });

  if (amount) {
    return amount / 100;
  }
  return 0;
}
