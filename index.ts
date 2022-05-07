require('dotenv').config();
const util = require('util');

import { getFunctions } from './modules/lambda';
import { removeResourcesFromSubnet, resumeResourcesInSubnet } from './modules/subnet';
import { getParametersByPath } from './modules/ssm';

// console.log(AWS.config);
// console.log(process.env.NODE_ENV);

const args = process.argv.slice(2);
console.log('args:', args);

const moduleName = args[0] || '';
console.log('module:', moduleName);

const cmd = args[1].split('=')[0] || '';
console.log('cmd:', cmd);

const value = args[1].split('=')[1] || '';
console.log('value:', value);

// base on cmd and value to determine the procedure need to run
(async () => {
  try {
    // moduleName
    switch (moduleName) {
      case 'subnet':
        if (cmd === 'removeResourcesFromSubnet') {
          removeResourcesFromSubnet(value);
        }

        if (cmd === 'removeResourcesFromSubnet') {
          resumeResourcesInSubnet(value);
        }
        break;
      case 'ssm':
        getParametersByPath();
        break;
      case 'lambda':
        getFunctions();
        break;
      default:
      // code block
    }
  } catch (e) {
    console.error(e);
  }
})();
