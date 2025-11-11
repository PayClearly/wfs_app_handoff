import Constants from '../../constants';

function getGalileoBinDropdownOptions() {
  const galileoBinOptions = Constants.GALILEO_BIN_OPTIONS;
  const binOptionsForDropdowns = galileoBinOptions.reduce((acc, bin) => {
    acc[`${bin}`] = {
      display: `${bin[0].toUpperCase()}${bin.slice(1)}`,
    };
    return acc;
  }, {});
  return binOptionsForDropdowns;
}

export default getGalileoBinDropdownOptions;
