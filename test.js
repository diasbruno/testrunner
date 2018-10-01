/* global require */
const {
  TestResult,
  TestP, Test,
  SuiteCollection
} = require('./src/index');

const {
  Success,
  Failed,
  Timeout,
  Exception
} = TestResult;

function a() {
  return 1;
}

(new SuiteCollection(
).suite(
  "test suite"
).assert(
  "simple test should succeed.", () => a() == 1
).assert(
  "simple test should fail.", () => a() != 1
).assertP(
  "expoted to be true", answer => answer(a() == 1)
).assertP(
  "some error", () => { throw new Error("asdf"); }
).assertP(
  "timeout", answer => {
    var d = Date.now();
    while ((Date.now() - d) < 4000) continue;
    answer(true);
  }
)).run()
