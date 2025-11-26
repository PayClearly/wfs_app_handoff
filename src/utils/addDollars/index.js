// Third Party Imports ...

function utils_addDollars(amounts = []) {
  let amount = 0;
  amounts
    .forEach((value) => {
      amount += Math.round(value * 100);

    });

  if (amount) {
    return amount / 100;
  }
  return 0;
}

export default utils_addDollars;

