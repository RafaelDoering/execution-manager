import ExecutionManager from "./src/index.ts";

async function main() {
  // Instantiate manager
  const manager = new ExecutionManager();

  // Add executions
  manager.addExecution({
    contextKey: 'test1',
    call: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(1);
        }, 10);
      });
    },
  }).addExecution({
    contextKey: 'test2',
    call: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(2);
        }, 15);
      });
    },
  }).addExecution({
    contextKey: 'test3',
    call: (context) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            result1: context.test1,
            result2: context.test2,
            result3: 3,
          });
        }, 5);
      });
    },
    contextDependencies: ['test1', 'test2'],
  });

  // Get result
  const result = await manager.execute();

  console.log(result);
  // { test1: 1, test2: 2, test3: { result1: 1, result2: 2, result3: 3 } }
}

main();
