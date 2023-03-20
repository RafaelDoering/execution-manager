export type Context = {[key: string]: unknown};

export type Execution = {
  contextKey: string;
  call: (context: Context) => unknown;
  contextDependencies?: string[];
};

export default class ExecutionManager {
  private context: Context = {};
  private executionsByLevel: {[key: number]: Array<Execution>} = {0: []};

  constructor(context?: Context) {
    if (context) {
      this.context = context;
    }

    return this;
  }

  public addExecution(execution: Execution): ExecutionManager {
    if (execution.contextDependencies) {
      const dependenciesLevel: Array<number> = [];
      execution.contextDependencies.forEach((contextDependency: string) => {
        const executionsWithLevel = Object.entries(this.executionsByLevel);
        const dependency = executionsWithLevel.find(([level, executions]) => {
          const foundDependency = executions.find(
            item => item.contextKey === contextDependency
          );

          if (foundDependency) {
            dependenciesLevel.push(+level);
          }

          return foundDependency;
        });

        if (!dependency && !this.context[contextDependency]) {
          throw 'Dependencia não encontrada';
        }
      });

      const executionLevel = Math.max(...dependenciesLevel) + 1;

      if (!this.executionsByLevel[executionLevel]) {
        this.executionsByLevel[executionLevel] = [];
      }

      this.executionsByLevel[executionLevel].push(execution);
    } else {
      this.executionsByLevel[0].push(execution);
    }

    return this;
  }

  public async execute(): Promise<Context> {
    const executionsByLevel = Object.values(this.executionsByLevel);

    for (const executionInLevel of executionsByLevel) {
      const responses = await Promise.all(
        executionInLevel.map(execution => execution.call(this.context))
      );

      for (const [index, response] of responses.entries()) {
        this.context[executionInLevel[index].contextKey] = response;
      }
    }

    return this.context;
  }
}
