/* global module, require, setTimeout, clearTimeout */

const { taggedSum } = require('daggy');

const TestResult = taggedSum('TestResult', {
  'Success': ['c'],
  'Failed': ['c'],
  'Timeout': ['c'],
  'Exception': ['c']
});

const {
  Success,
  Failed,
  Timeout,
  Exception
} = TestResult;

const noop = () => {};

const compose = (g, f) => x => g(f(x));

const undefined = (void 0);

const TIMEOUT = -2;
const ERROR = -1;
const PENDING = 0;
const FINISHED = 1;

const TimeoutP =
  (context, wait) => new Promise((_, f) => setTimeout(() => {
    context.result = false;
    f(Timeout(context));
  }, wait));

class Job {
  constructor(context, fn, wait) {
    this.context = context;
    this.fn = fn;
    this.state = PENDING;
    this.wait = wait || Infinity;
    this.run = this.run.bind(this);
  }

  run(c) {
    return Promise.race((
      this.wait == Infinity ? [] : [
        TimeoutP(this.context, this.wait + 100)
      ]
    ).concat([
      new Promise((s, f) => {
        this.state = PENDING;
        try {
          this.fn(s);
        } catch(e) {
          f(Exception(e));
        }
      })
    ])).then(result => {
      this.context.result = result;
      c((result ? Success : Failed)(this.context));
      return result;
    }).catch(e => {
      this.state = !e ? TIMEOUT : ERROR;
      c(Failed(this.context));
      return e;
    });
  }
}

class Suite {
  constructor(label) {
    this.label = label;
    this.tests = [];
    this.collect = this.collect.bind(this);
  }

  assert(label, fn) {
    return this.tests.push(
      new Job(
        { label, result: null },
        answer => new Promise(
          (s, f) => { let r; (r = fn()) ? s(r) : f(r); }
        ).then(answer).catch(answer)
      )
    ), this;
  }

  assertP(label, fn, wait) {
    return this.tests.push(
      new Job(
        { label, result: null },
        answer => fn(answer),
        wait || 2000
      )
    ), this;
  }

  collect(res) {
    this.results = this.results.concat(res);
  }

  run() {
    this.results = [this.label];
    let cps = Promise.resolve([this.label]);
    for (var i = 0; i < this.tests.length; i++) {
      const t = this.tests[i];
      cps = cps.finally(
        r => {
          return t.run(this.collect);
        }
      );
    }
    cps.then(r => console.log("Results", this.results));
  }
}

class SuiteCollection {
  constructor() {
    this.collection = [];
  }

  suite(label) {
    const suite = new Suite(label);
    return this.collection.push(suite), suite;
  }

  run() {
    return this.collection.map(
      c => c.run()
    );
  }
}

module.exports = {
  Job,
  TestResult,
  Suite,
  SuiteCollection
};
