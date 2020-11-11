let logLevel = process.env.LOG_LEVEL;
const logLevels = [ 'DEBUG', 'LOG', 'INFO', 'ERROR' ];
if (!logLevel) {
  logLevel = 'ERROR';
}

const levelIdx = logLevels.indexOf(logLevel);
let logOverrides;
if (logLevel === 'OFF') {
  logOverrides = logLevels.reduce((obj, level) => {
    return {
      ...obj,
      [level.toLowerCase()]: jest.fn(),
    }
  }, {});
} else {
  logOverrides = logLevels.reduce((obj, level, idx) => {
    const method = {};
    if (idx < levelIdx) {
      method[level.toLowerCase()] = jest.fn();
    }
    return {
      ...obj,
      ...method,
    }
  }, {});
}

global.console = {
  ...console,
  ...logOverrides,
};
