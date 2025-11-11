// Third Party Imports ...


function utils_store_collectionHelper(currentState, newState) {
  const state = Object.keys(currentState).reduce((collections, collectionDomain) => {
    const updatedCollection = Object.keys(newState[collectionDomain]).reduce((acc, curr) => {
      if (!Array.isArray(currentState[collectionDomain][curr]) || !Array.isArray(newState[collectionDomain][curr])) return acc;
      acc[curr] = [...(currentState[collectionDomain][curr] || []), ...newState[collectionDomain][curr]].reduce((acc, curr) => {
        if (!acc.includes(curr)) acc.push(curr);
        return acc;
      }, []);
      return acc;
    }, []);
    collections[collectionDomain] = { ...(currentState[collectionDomain] || {}), ...updatedCollection };
    return collections;
  }, {});
  return state;
}

export default utils_store_collectionHelper;


