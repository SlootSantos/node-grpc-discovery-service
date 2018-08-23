const REGISTRY_PROTO_PATH = __dirname + '/protos/registry.proto';

const { promisify } = require('util');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(REGISTRY_PROTO_PATH);
const { registry: registryProto } = grpc.loadPackageDefinition(packageDefinition);

(async () => {
  const client = new registryProto.Registry('localhost:3333', grpc.credentials.createInsecure());
  const promisableFns = ['register', 'unregister', 'fetchSingleService'];

  // I wrapped the client instance in a proxy because...
  // I can.
  // I wanted to use promise, and because I didn't want to
  // write an astonishing number of 4 lines to promisify all of those functions
  // Looks kinda sexy to use a proxy.. doesn't it?
  // WARNING: though it looks sexy, please be aware that we are creating a new
  // function instance on every property look up.
  // "promisify(target[property])" creates a new function everytime!
  const clientProxy = new Proxy(client, {
    get: (target, property) => {
      return promisableFns.includes(property)
        ? promisify(target[property])
        : target[property];
    }
  });

  const response = await clientProxy.register({
    name: 'SomeService',
    ipv4: '127.0.0.0',
    port: '5000'
  });

  const res = await clientProxy.unregister({
    name: 'SomeService'
  });

  const ress = await clientProxy.fetchSingleService({
      registrations: [{
      name: 'SomeService'
    }]
  });

  console.log(response);
  console.log(res);
})()
