require('dotenv').config();
const util = require('util');

import { addLambdaToSubnet, removeLambdaToSubnet } from './modules/lambda';
import { attachElbToSubnet, detachElbToSubnet } from './modules/elb';

// console.log(AWS.config);
// console.log(process.env.NODE_ENV);

const args = process.argv.slice(2);
console.log('args:', args);

// if (args.length !== 2) {
//   console.error('not a proper args', args);
// }

const cmd = args[0].split('=')[1] || 'remove';
console.log('cmd:', cmd);

const value = args[1].split('=')[1] || 'subnet-b';
console.log('value:', value);

// base on cmd and value to determine the procedure need to run
(async () => {
  try {
    if (!process.env.VPC_ID_LAMBDA) return;

    if (cmd === 'remove') {
      detachElbToSubnet(process.env.VPC_ID_LAMBDA, value);
      removeLambdaToSubnet(process.env.VPC_ID_LAMBDA, value);
      console.log('run remove command successfully.');
    }

    if (cmd === 'resume') {
      attachElbToSubnet(process.env.VPC_ID_LAMBDA, value);
      addLambdaToSubnet(process.env.VPC_ID_LAMBDA, value);
      console.log('run resume command successfully.');
    }
  } catch (e) {
    console.error(e);
  }
})();
