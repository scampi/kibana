var _ = require('lodash');
var config = require('../config');
var Agent = require('http').Agent;
var SslAgent = require('http').Agent;
var read = _.partialRight(require('fs').readFileSync, 'utf8');

exports.buildHttpAgent = function () {
  return new Agent(exports.basicAgentConfig());
};

exports.basicAgentConfig = function basicAgentConfig() {
  return _.pick(config, 'maxSockets');
};

exports.buildHttpsAgent = function buildForHttps() {
  var config = exports.basicAgentConfig();
  var caPath = _.get(config, 'kibana.ca');
  var crtPath = _.get(config, 'kibana.kibana_elasticsearch_client_crt');
  var keyPath = _.get(config, 'kibana.kibana_elasticsearch_client_key');

  // If the target is backed by an Ssl and a CA is provided via the config
  // then we need to inject the CA
  if (caPath) config.ca = read(caPath);

  // Add client certificate and key if provided
  if (crtPath && keyPath) {
    config.cert = read(crtPath, 'utf8');
    config.key = read(keyPath, 'utf8');
  }

  return new SslAgent(config);
};

exports.buildForProtocol = function (protocol) {
  return /^https/.test(protocol) ? exports.buildHttpsAgent() : exports.buildHttpAgent();
};
