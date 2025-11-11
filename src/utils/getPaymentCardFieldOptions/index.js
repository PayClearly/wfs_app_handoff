// Third Party Imports ...

// import Utils from 'utils';

function utils_getPaymentCardFieldOptions() {
  return {
    DAY_OF_WEEK_OPTIONS: {
      1: { display: 'Monday' },
      2: { display: 'Tuesday' },
      3: { display: 'Wednesday' },
      4: { display: 'Thursday' },
      5: { display: 'Friday' },
    },
    MONTH_OPTIONS: {
      0: { display: 'Jan' },
      1: { display: 'Feb' },
      2: { display: 'Mar' },
      3: { display: 'Apr' },
      4: { display: 'May' },
      5: { display: 'Jun' },
      6: { display: 'Jul' },
      7: { display: 'Aug' },
      8: { display: 'Sep' },
      9: { display: 'Oct' },
      10: { display: 'Nov' },
      11: { display: 'Dec' },
    },
    FREQUENCY_OPTIONS: {
      daily: { display: 'Daily' },
      weekly: { display: 'Weekly' },
      monthly: { display: 'Monthly' },
      annually: { display: 'Annually' },
    },
    REGION_OPTIONS: {
      USA: { display: 'United States' },
      CAN: { display: 'Canada' },
      USC: { display: 'USA and Canada' },
      INT: { display: 'International' },
      NAM: { display: 'North America' },
    },
    MAX_USES_OPTIONS: {
      1: { display: '1' },
      5: { display: '5' },
      10: { display: '10' },
      25: { display: '25' },
      100: { display: '100' },
      99999: { display: 'Max - 99,999' },
    },
    TRIGGER_OPTIONS: {
      '': { display: 'None' },
      periodic: { display: 'Subscription' },
      threshold: { display: 'Threshold' },
    },
    STATUS_OPTIONS: {
      active: { display: 'Active' },
      on_hold: { display: 'Hold' },
    },
    BIN_OPTIONS: {
      credit: { display: 'Credit' },
      debit: { display: 'Debit' },
    },
  };
}

export default utils_getPaymentCardFieldOptions;


