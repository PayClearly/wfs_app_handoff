// Third Party Imports ...

// import Utils from 'utils';

function utils_backgroundtask(params, task) {

  return Promise.resolve()
    .then(() => {
      return task(params);
    });

  /* @WIP this deosnt work as the code is minified and can't run in the worker. would need babel for this to work */

  /*
  const workers = {};
  return new Promise((resolve, reject) => {

    const blob = new Blob([
      document.querySelector('#backgroundtask').textContent,
    ], { type: 'text/javascript' });

    workers.worker = new Worker(window.URL.createObjectURL(blob));

    let toCall = task.toString().split('(').slice(1, 100).join('(');
    const paramsName = toCall.split(')').shift();
    toCall = toCall.replace(')', '').replace('{', '').slice(0, -1);

    workers.worker.onmessage = ({ data }) => {
      if (data.data) {
        resolve(data.data);
      } else {
        reject(data.error);
      }
    };

    workers.worker.postMessage({
      message: 'backgroundtask',
      paramsName,
      params,
      task: toCall,
    });

  })
  .then((toreturn) => {
    delete workers.worker;
    return toreturn;
  });
  */

}

export default utils_backgroundtask;


