const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function getMonthsForDropdown() {
  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  const firstDropdownMonth = `${monthNames[thisMonth]}`;
  const firstDropdownYear = `${thisYear}`;

  const secondDropdownMonth = `${monthNames[thisMonth === 0 ? 11 : thisMonth - 1]}`;
  const secondDropdownYear = `${thisMonth === 0 ? thisYear - 1 : thisYear}`;

  const thirdDropdownMonth = thisMonth === 0 ? `${monthNames[10]}` : thisMonth === 1 ? `${monthNames[11]}` : `${monthNames[ thisMonth - 2]}`;
  const thirdDropdownYear = `${thisMonth === 0 || thisMonth === 1 ? thisYear - 1 : thisYear}`;

  return [`${firstDropdownMonth} ${firstDropdownYear}`, `${secondDropdownMonth} ${secondDropdownYear}`, `${thirdDropdownMonth} ${thirdDropdownYear}`];
}

export default monthNames;
