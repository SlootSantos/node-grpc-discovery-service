const REGISTRY_PROTO_PATH = __dirname + '/protos/registry.proto';

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(REGISTRY_PROTO_PATH);
const { registry: registryProto } = grpc.loadPackageDefinition(packageDefinition);

const registryStore = new Map();

// This function registers any given service
// Then stores it in the registry Map
// When the specific service already exists as a key
// we simply override it, since we assume the latest registration is the correct one
const register = ({ request: { name, ipv4, port } }, rpcCallback) => {
  let error;
  let message;

  try {
    registryStore.set(name, { ipv4, port });

    message = `${name} was registered under ${ipv4}:${port}`;
  } catch (e) {
    error = e;
  }

  rpcCallback(error, { message });
};

const unregister = ({ request: { name } }, rpcCallback) => {
  let error;
  let message;

  try {
    registryStore.delete(name);
    message = `${name} was unregistered`;
  } catch (e) {
    error = e;
  }

  rpcCallback(error, { message });
}

const fetchSingleService = ({ request }, rpcCallback) => {

  console.log(request);
  let error;
  let message;
  let payload;

  try {
    // registryStore.get(name);
    // message = `${name} was fetched`;
  } catch (e) {
    error = e;
  }

  rpcCallback(error, { message, payload })
}

(() => {
  const server = new grpc.Server();

  server.addService(registryProto.Registry.service, {
    register,
    unregister,
    fetchSingleService
  });

  server.bind('0.0.0.0:3333', grpc.ServerCredentials.createInsecure());
  server.start();
})()
