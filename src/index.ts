export type BaseContext = Record<string, unknown>;

export type Execution<ContextKey extends string, Context, Result> = {
  contextKey: ContextKey;
  call: (context: Context) => Result;
  contextDependencies?: string[];
};

export default class ExecutionManager<Context extends BaseContext> {
  private context: Context;
  private executionsByLevel: Record<
    number,
    Array<Execution<string, Context, unknown>>
  > = { 0: [] };

  constructor(context?: Context) {
    this.context = context || ({} as Context);
  }

  public addExecution<ContextKey extends string, Result>(
    execution: Execution<ContextKey, Context, Result>
  ): ExecutionManager<Context & Record<ContextKey, Awaited<Result>>> {
    if (execution.contextDependencies) {
      const dependenciesLevel: Array<number> = [];
      execution.contextDependencies.forEach((contextDependency: string) => {
        const executionsWithLevel = Object.entries(this.executionsByLevel);
        const dependency = executionsWithLevel.find(([level, executions]) => {
          const foundDependency = executions.find(
            (item) => item.contextKey === contextDependency
          );

          if (foundDependency) {
            dependenciesLevel.push(+level);
          }

          return foundDependency;
        });

        if (!dependency && !this.context[contextDependency]) {
          throw "Dependencia não encontrada";
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

    return this as ExecutionManager<Context & Record<string, Awaited<Result>>>;
  }

  public async execute(): Promise<Context> {
    const executionsByLevel = Object.values(this.executionsByLevel);

    for (const executionInLevel of executionsByLevel) {
      const responses = await Promise.all(
        executionInLevel.map((execution) => execution.call(this.context))
      );

      for (const [index, response] of responses.entries()) {
        (this.context as BaseContext)[executionInLevel[index].contextKey] =
          response;
      }
    }

    return this.context as unknown as Promise<Context>;
  }
}
