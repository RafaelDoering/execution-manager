# Execution Manager

A promise manager

## Features

- Resolve Promises in concurrently
- Works also with conventional functions
- Manage dependencies between executions
- Typescript support

## Installing

Using npm:

```bash
$ npm install execution-manager
```

## Example

```typescript
import ExecutionManager from 'execution-manager';

// Instantiate manager
const manager = new ExecutionManager()
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

// Get result
const result = await manager.execute();

// { test1: 1, test2: 2, test3: { result1: 1, result2: 2, result3: 3 } }
console.log(result);
```

## License

MIT License

Copyright (c) 2022 Rafael Doering

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
