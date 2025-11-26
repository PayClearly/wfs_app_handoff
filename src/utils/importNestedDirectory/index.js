// Third Party Imports ...

function utils_importNestedDirectory(context) {
  return context.keys().reduce(((acc, key) => {
    const name = key.split('/')[1];
    if (!name || name === '.' || !context(key).default) return acc; // return if does not match structure
    acc[name] = context(key).default;
    return acc;
  }), {});
}

export default utils_importNestedDirectory;

