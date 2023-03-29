import { expect, test } from "@jest/globals";

import ExecutionManager from "./index";

test("execute should return nothing when called without add execution", async () => {
  const subject = new ExecutionManager();

  const result = await subject.execute();

  expect(result).toStrictEqual({});
});

test("execute should return initial context when called without add execution", async () => {
  const subject = new ExecutionManager({
    test1: 1,
  });

  const result = await subject.execute();

  expect(result).toStrictEqual({
    test1: 1,
  });
});

test("execute should return context with execution result when called after add execution", async () => {
  const subject = new ExecutionManager({
    test1: 1,
  }).addExecution({
    contextKey: "test2",
    call: () => {
      return 2;
    },
  });

  const result = await subject.execute();

  expect(result).toStrictEqual({
    test1: 1,
    test2: 2,
  });
});

test("execute should return context with execution result when called after add execution with promise", async () => {
  const subject = new ExecutionManager({
    test1: 1,
  }).addExecution({
    contextKey: "test2",
    call: () => {
      return new Promise<number>((resolve) => {
        setTimeout(() => {
          resolve(2);
        }, 10);
      });
    },
  });

  const result = await subject.execute();

  expect(result).toStrictEqual({
    test1: 1,
    test2: 2,
  });
});

test("addExecution should pass context to call ", async () => {
  const subject = new ExecutionManager({
    test1: 1,
  }).addExecution({
    contextKey: "test2",
    call: (context) => {
      return {
        result1: context.test1,
        result2: 2,
      };
    },
  });

  const result = await subject.execute();

  expect(result).toStrictEqual({
    test1: 1,
    test2: {
      result1: 1,
      result2: 2,
    },
  });
});

test("execute should return context with executions result when called after add execution with dependency", async () => {
  const subject = new ExecutionManager({
    test1: 1,
  })
    .addExecution({
      contextKey: "test2",
      call: () => {
        return 2;
      },
    })
    .addExecution({
      contextKey: "test3",
      call: (context) => {
        return {
          result1: context.test1,
          result2: context.test2,
          result3: 3,
        };
      },
      contextDependencies: ["test1", "test2"],
    });

  const result = await subject.execute();

  expect(result).toStrictEqual({
    test1: 1,
    test2: 2,
    test3: {
      result1: 1,
      result2: 2,
      result3: 3,
    },
  });
});

test("execute should return context with executions result when called after add execution with promises and dependencies", async () => {
  const subject = new ExecutionManager()
    .addExecution({
      contextKey: "test1",
      call: () => {
        return new Promise<number>((resolve) => {
          setTimeout(() => {
            resolve(1);
          }, 10);
        });
      },
    })
    .addExecution({
      contextKey: "test2",
      call: () => {
        return new Promise<number>((resolve) => {
          setTimeout(() => {
            resolve(2);
          }, 15);
        });
      },
    })
    .addExecution({
      contextKey: "test3",
      call: (context) => {
        return new Promise<{
          result1: number;
          result2: number;
          result3: number;
        }>((resolve) => {
          setTimeout(() => {
            resolve({
              result1: context.test1,
              result2: context.test2,
              result3: 3,
            });
          }, 5);
        });
      },
      contextDependencies: ["test1", "test2"],
    });

  const result = await subject.execute();

  expect(result).toStrictEqual({
    test1: 1,
    test2: 2,
    test3: {
      result1: 1,
      result2: 2,
      result3: 3,
    },
  });
});
