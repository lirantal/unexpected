/* global jasmine */
let pendingPromisesForTheCurrentTest = [];
let afterEachRegistered = false;

let currentSpec = null;

if (typeof jasmine === 'object') {
  // Add a custom reporter that allows us to capture the name of the currently executing spec:
  jasmine.getEnv().addReporter({
    specStarted(spec) {
      currentSpec = spec;
    },
    specDone(spec) {
      currentSpec = null;
    }
  });
}

function isPendingOrHasUnhandledRejection(promise) {
  return (
    !promise._fulfillmentHandler0 &&
    !promise._rejectionHandler0 &&
    !promise._receiver0 &&
    (promise.isPending() || (promise.isRejected() && promise.reason().uncaught))
  );
}

function registerAfterEachHook() {
  if (typeof afterEach === 'function' && !afterEachRegistered) {
    afterEachRegistered = true;
    try {
      afterEach(function() {
        let error;
        let testPassed = true;
        if (
          pendingPromisesForTheCurrentTest.some(
            isPendingOrHasUnhandledRejection
          )
        ) {
          let displayName;
          if (this.currentTest) {
            // mocha
            testPassed = this.currentTest.state === 'passed';
            displayName = this.currentTest.title;
          } else if (typeof currentSpec === 'object') {
            testPassed = currentSpec.failedExpectations.length === 0;
            displayName = currentSpec.fullName;
          }
          error = new Error(
            `${displayName}: You have created a promise that was not returned from the it block`
          );
        }
        pendingPromisesForTheCurrentTest = [];
        if (error && testPassed) {
          throw error;
        }
      });
    } catch (e) {
      // The benchmark suite fails when attempting to add an afterEach
    }
  }
}

// When running in jasmine/node.js, afterEach is available immediately,
// but doesn't work within the it block. Register the hook immediately:
registerAfterEachHook();

module.exports = function notifyPendingPromise(promise) {
  pendingPromisesForTheCurrentTest.push(promise);
  // Register the afterEach hook lazily (mocha/node.js):
  registerAfterEachHook();
};
