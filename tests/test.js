const assert = require('assert'),
  test = require('selenium-webdriver/testing'),
  webdriver = require('selenium-webdriver');


Promise.sequence = (promiseFactories) => {
  let promise = Promise.resolve();
  promiseFactories.forEach((promiseFactory) => {
    promise = promise.then(() => {
      promiseFactory();
    });
  });
  return promise;
};

Promise.parallel = (promiseFactories) => {
  let promises = [];
  promiseFactories.forEach(promiseFactory => {
    promises.push(promiseFactory());
  });
  return Promise.all(promises);
};

class Tester {
  static get CHROME () { return 'chrome' };
  static get FIREFOX () { return 'firefox' };
  static get OPERA () { return 'opera' };
  static get IE () { return 'ie' };
  static get EDGE () { return 'edge' };


  constructor(remoteUrl) {
    this.remoteUrl = remoteUrl;
  }

  testWith(browsers, callback) {
    let drivers = browsers.map((browser) => this.getBrowserDriver(browser));
    let promiseFactories = [];
    for(let i = 0; i < drivers.length; i++) {
      promiseFactories.push(() => {
        return this.testWithDriver(drivers[i], callback);
      });
    }
    return Promise.parallel(promiseFactories);
  }

  testWithDriver(driver, callback) {
    return new Promise((resolve, reject) => {
      callback(driver, resolve);
    });
  }

  getBrowserDriver(browserName) {
    let capabilities = null;

    switch(browserName) {
      case Tester.CHROME:
        capabilities = webdriver.Capabilities.chrome();
        break;
      case Tester.IE:
        capabilities = webdriver.Capabilities.ie();
        break;
      case Tester.FIREFOX:
        capabilities = webdriver.Capabilities.firefox();
        break;
      case Tester.OPERA:
        capabilities = webdriver.Capabilities.opera();
        break;
      case Tester.EDGE:
        capabilities = webdriver.Capabilities.edge();
        break;
      default:
        throw new Error('Can\'t find browswer name ' + browserName);
      // return null;
    }

    return new webdriver.Builder()
      .usingServer(this.remoteUrl)
      .withCapabilities(capabilities)
      .build();
  }

  navigate(driver, path) {
    return driver.executeScript('return window.router.navigate(' + JSON.stringify(path) + ');');
  }

  executeScript(driver, script) {
    return this.executeAsyncScript(driver, `resolve(
      (function() {
        ${script}
      })()
    );`);
  }

  executeAsyncScript(driver, script) {
    return driver.executeAsyncScript(`
     var __done = arguments[arguments.length - 1];
     var resolve = function(data) {
      __done({ success : true, data: data });
     };
     var reject = function(error) {
      __done({
        success : false,
        error: {
          name: error.name,
          message: (error.message || error.description),
          stack: error.stack
        }
      });
     };
     
     try {
      ${script}
     } catch(error) {
      reject(error);
     }
    `).then((data) => {
      if(data.success) {
        return data.data;
      } else {
        throw new Error(data.error.stack + '\n\n');
      }
    });
  }

  untilIsNotVisible(element) {
    return () => {
      return element.isDisplayed().then(() => false).catch(() => true);
    };
  }

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, ms);
    });
  }
}

const config = require('./config.json');
const tester = new Tester(config.testServer);


test.describe('EventObject', function() {
  this.timeout(30000);

  tester.testWith([
    Tester.EDGE,
    Tester.CHROME,
    // Tester.FIREFOX,
    // Tester.OPERA,
    // Tester.IE
  ], (driver, done) => {
    driver.manage().timeouts().setScriptTimeout(15000);


    test.before(() => {
      driver.manage().timeouts().pageLoadTimeout(1000);
       driver.navigate().to(config.testHost);
      return tester.sleep(2000);
    });

    test.it('Test EventObject Hierarchy', () => {
      return tester.executeScript(driver, `
        var eventObject_01 = new EventObject();
        var eventObject_02 = new EventObject();
        eventObject_01.appendChild(eventObject_02);

        if(eventObject_01.parentEventObject !== null) throw new Error('eventObject_01.parentEventObject !== null');
        if(eventObject_02.parentEventObject !== eventObject_01) throw new Error('eventObject_02.parentEventObject !== eventObject_01');
        if(eventObject_01.childEventObjects[0] !== eventObject_02) throw new Error('eventObject_01.childEventObjects[0] !== eventObject_02');

        eventObject_01.removeChild(eventObject_02);

        if(eventObject_02.parentEventObject !== null) throw new Error('eventObject_02.parentEventObject !== null');
        if(eventObject_01.childEventObjects.length > 0) throw new Error('eventObject_01.childEventObjects.length > 0');

      `)/*.then((data) => {
        console.log(data);
      })*/;
    });

    test.it('Test EventObject Listener', () => {
      return tester.executeAsyncScript(driver, `
        var eventObject_01 = new EventObject();
        var eventObject_02 = new EventObject();
        eventObject_01.appendChild(eventObject_02);

        eventObject_01.addEventListener('test', function() {
          resolve();
        });

        eventObject_02.dispatchEvent(new CustomEvent('test', { bubbles: true }));

        setTimeout(function() {
          reject(new Error('Event not caught'));
        }, 1000);
      `);
    });

    test.after(() => {
      driver.quit();
      done();
    });
  });
});


