import Constants from '../../constants';

function getProviderBinDropdownOptions() {
  const providerBinOptions = Constants.ProviderBIN_OPTIONS;
  const binOptionsForDropdowns = providerBinOptions.reduce((acc, bin) => {
    acc[`${bin}`] = {
      display: `${bin[0].toUpperCase()}${bin.slice(1)}`,
    };
    return acc;
  }, {});
  return binOptionsForDropdowns;
}

export default getProviderBinDropdownOptions;
