// Third Party Imports ...

function utils_backgroundtask(params, task) {

  return Promise.resolve()
    .then(() => {
      return task(params);
    });

  /* @WIP this deosnt work as the code is minified and can't run in the worker. would need babel for this to work */

}

export default utils_backgroundtask;

