'use strict';

const axios = require('axios');

function RpcClient(opts) {
  opts = opts || {};
  this.host = opts.host || '127.0.0.1';
  this.port = opts.port || 55003;
  this.user = opts.user || 'user';
  this.pass = opts.pass || 'pass';
  this.protocol = opts.protocol || 'https';
  this.batchedCalls = null;

  if (RpcClient.config.log) {
    this.log = RpcClient.config.log;
  } else {
    this.log = RpcClient.loggers[RpcClient.config.logger || 'normal'];
  }
}

const cl = console.log.bind(console);

const noop = function() {};

RpcClient.loggers = {
  none: { info: noop, warn: noop, err: noop, debug: noop },
  normal: { info: cl, warn: cl, err: cl, debug: noop },
  debug: { info: cl, warn: cl, err: cl, debug: cl }
};

RpcClient.config = {
  logger: 'normal' // none, normal, debug
};

async function rpc(request) {
  const self = this;
  request = JSON.stringify(request);

  const options = {
    url: '/',
    method: 'POST',
    baseURL: `${self.protocol}://${self.host}:${self.port}`,
    headers: {
      'Content-Length': request.length,
      'Content-Type': 'application/json'
    },
    data: request,
    auth: {
      username: self.user,
      password: self.pass
    }
  };

  const errorMessage = 'ION JSON-RPC:';

  return axios(options)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          self.log.err(err.message);

          if (err.response.status === 401) {
            throw new Error(`${errorMessage} Connection Rejected: 401 Unnauthorized`);
          }

          if (err.response.status === 403) {
            throw new Error(`${errorMessage} Connection Rejected: 403 Forbidden`);
          }

          const error = new Error(`${errorMessage} Connection Rejected: ${err.response.data.error.code} ${err.response.data.error.message}`);
          error.code = err.response.data.error.code;
          throw error;
        } else if (err.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          self.log.err(err.message);
          throw new Error(`${errorMessage} Request Error: ${err.message}`);
        } else {
          // Something happened in setting up the request that triggered an Error
          self.log.err('Error', err.message);
          throw err;
        }
      });
}

RpcClient.prototype.batch = async function(batchCallback) {
  this.batchedCalls = [];
  batchCallback();
  const data = await rpc.call(this, this.batchedCalls);
  this.batchedCalls = null;
  return data;
};

RpcClient.callspec = {
  // == Addressindex ==
  getAddressBalance: 'obj',
  getAddressDeltas: 'obj',
  getAddressMempool: 'obj',
  getAddressTxids: 'obj',
  getAddressUtxos: 'obj',

  // == Blockchain ==
  getBestBlockHash: '',
  getBestChainLock: '',
  getBlock: 'str int',
  getBlockchainInfo: '',
  getBlockCount: '',
  getBlockHash: 'int',
  getBlockHashes: 'int int obj',
  getBlockHeader: 'str bool',
  getBlockHeaders: 'str int bool',
  getBlockStats: 'str',
  getChainTips: '',
  getChainTxStats: 'int str',
  getDifficulty: '',
  getMempoolAncestors: 'str bool',
  getMempoolDescendants: 'str bool',
  getMemPoolEntry: 'str',
  getMemPoolInfo: '',
  getMerkleBlocks: 'str str int',
  getRawMemPool: 'bool',
  getSpecialTxes: 'str int int int int',
  getSpentInfo: 'obj',
  getTxOut: 'str int bool',
  getTxOutProof: 'str str',
  getTxOutSetInfo: '',
  preciousBlock: 'str',
  pruneBlockchain: '',
  scanTxOutSet: 'str',
  verifyChain: 'int int',
  verifyTxOutProof: 'str',

  // == Control ==
  debug: 'str',
  getInfo: '',
  getMemoryInfo: 'str',
  help: '',
  stop: '',
  uptime: '',

  // == Evo ==
  bls: 'str',
  protx: 'str',
  quorum: 'str',

  // == Generating ==
  generate: 'int',
  generateToAddress: 'int str',

  // == Ion ==
  getGovernanceInfo: '',
  getPoolInfo: '',
  getPrivateSendInfo: '',
  getSuperBlockBudget: 'int',
  gObject: 'str',
  masternode: 'str',
  masternodeList: '',
  mnSync: 'str',
  privateSend: 'str',
  spork: 'str',
  voteRaw: 'str int str str str str str',

  // == Mining ==
  getBlockTemplate: '',
  getMiningInfo: '',
  getnetworkhashps: '',
  prioritiseTransaction: 'str float int',
  submitBlock: '',

  // == Network ==
  addNode: '',
  clearBanned: '',
  disconnectNode: '',
  getAddedNodeInfo: '',
  getConnectionCount: '',
  getNetTotals: '',
  getNetworkInfo: '',
  getPeerInfo: '',
  listBanned: '',
  ping: '',
  setBan: 'str str',
  setNetworkActive: 'bool',

  // == Raw Transactions ==
  combineRawTransaction: 'str',
  createRawTransaction: 'obj obj',
  decodeRawTransaction: '',
  decodeScript: 'str',
  fundRawTransaction: 'str',
  getRawTransaction: 'str int',
  sendRawTransaction: 'str',
  signRawTransaction: '',

  // == Tokens ==
  configureManagementToken: 'str str int str str',
  configureToken: 'str str int str str',
  createTokenAuthorities: 'str str',
  dropTokenAuthorities: 'str str int',
  getSubgroupId: 'str str',
  getTokenBalance: '',
  getTokenTransaction: 'str',
  listTokenAuthorities: '',
  listTokensSinceBlock: 'str',
  listTokenTransactions: 'str',
  meltToken: 'str int',
  mintToken: 'str str int',
  scanTokens: 'str',
  sendToken: 'str str int',
  tokenInfo: 'str',

  // == Util ==
  createMultiSig: '',
  estimateFee: '',
  estimateSmartFee: 'int str',
  signMessageWithPrivKey: 'str str',
  validateAddress: '',
  verifyMessage: '',

  // == Wallet ==
  abandonTransaction: 'str',
  abortRescan: '',
  addMultiSigAddress: '',
  backupWallet: '',
  dumpHdInfo: '',
  dumpPrivKey: '',
  dumpWallet: 'str',
  encryptWallet: '',
  getAccount: '',
  getAccountAddress: 'str',
  getAddressesByAccount: '',
  getBalance: 'str int',
  getExtendedBalance: '',
  getNewAddress: '',
  getRawChangeAddress: '',
  getReceivedByAccount: 'str int',
  getReceivedByAddress: 'str int',
  getStakingStatus: '',
  getTransaction: '',
  getUnconfirmedBalance: '',
  getWalletInfo: '',
  importAddress: 'str str bool',
  importElectrumWallet: 'str',
  importMulti: 'obj obj',
  importPrivKey: 'str str bool',
  importPrunedFunds: 'str str',
  importPubKey: 'str',
  importWallet: 'str',
  keepass: 'str',
  keyPoolRefill: '',
  listAccounts: 'int',
  listAddressBalances: '',
  listAddressGroupings: '',
  listLockUnspent: 'bool',
  listReceivedByAccount: 'int bool',
  listReceivedByAddress: 'int bool',
  listSinceBlock: 'str int',
  listTransactionRecords: 'str int int',
  listTransactions: 'str int int',
  listUnspent: 'int int',
  listWallets: '',
  lockUnspent: '',
  move: 'str str float int str',
  removePrunedFunds: 'str',
  sendFrom: 'str str float int str str',
  sendMany: 'str obj int str',
  sendToAddress: 'str float str str',
  setAccount: '',
  setPrivateSendAmount: 'int',
  setPrivateSendRounds: 'int',
  setTxFee: 'float',
  signMessage: '',
  walletLock: '',
  walletPassPhrase: 'string int',
  walletPassphraseChange: ''
};

const slice = function(arr, start, end) {
  return Array.prototype.slice.call(arr, start, end);
};

function generateRPCMethods(constructor, apiCalls, rpc) {
  function createRPCMethod(methodName, argMap) {
    return async function() {
      const limit = arguments.length;

      for (let i = 0; i < limit; i++) {
        if (argMap[i]) {
          arguments[i] = argMap[i](arguments[i]);
        }
      }

      if (this.batchedCalls) {
        this.batchedCalls.push({
          jsonrpc: '2.0',
          method: methodName,
          params: slice(arguments),
          id: getRandomId()
        });
      } else {
        const call = rpc.call(this, {
          method: methodName,
          params: slice(arguments),
          id: getRandomId()
        });
        return await call;
      }
    };
  }

  const types = {
    str: function(arg) {
      return arg.toString();
    },
    int: function(arg) {
      return parseFloat(arg);
    },
    float: function(arg) {
      return parseFloat(arg);
    },
    bool: function(arg) {
      return (arg === true || arg === '1' || arg === 'true' || arg.toString().toLowerCase() === 'true');
    },
    obj: function(arg) {
      if (typeof arg === 'string') {
        return JSON.parse(arg);
      }
      return arg;
    }
  };

  for (const k in apiCalls) {
    const spec = apiCalls[k].split(' ');
    for (let i = 0; i < spec.length; i++) {
      if (types[spec[i]]) {
        spec[i] = types[spec[i]];
      } else {
        spec[i] = types.str;
      }
    }
    const methodName = k.toLowerCase();
    constructor.prototype[k] = createRPCMethod(methodName, spec);
    constructor.prototype[methodName] = constructor.prototype[k];
  }
}

function getRandomId() {
  return parseInt(Math.random() * 100000);
}

generateRPCMethods(RpcClient, RpcClient.callspec, rpc);

module.exports = RpcClient;
