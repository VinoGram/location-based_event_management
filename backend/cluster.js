const cluster = require('cluster');
const os = require('os');

const WORKERS = parseInt(process.env.WEB_CONCURRENCY) || os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} starting ${WORKERS} workers`);

  for (let i = 0; i < WORKERS; i++) cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`Worker ${worker.process.pid} died (${signal || code}) — restarting`);
    cluster.fork();
  });
} else {
  require('./server.js');
  console.log(`Worker ${process.pid} started`);
}
