export type BaseContext = Record<string, unknown>;

export type Execution<
  ContextKey extends string,
  Context extends BaseContext,
  Result,
  ContextDependenciesKeys extends string[]
> = {
  contextKey: ContextKey;
  call: (context: Pick<Context, ContextDependenciesKeys[number]>) => Result;
  contextDependencies?: ContextDependenciesKeys;
};

export default class ExecutionManager<Context extends BaseContext = {}> {
  private context: Context;
  private executionsByLevel: Record<
    number,
    Array<Execution<any, Context, unknown, any>>
  > = { 0: [] };

  constructor(context?: Context) {
    this.context = context || ({} as Context);
  }

  public addExecution<
    ContextKey extends string,
    Result,
    ContextDependenciesKeys extends (keyof Context & string)[]
  >(
    execution: Execution<ContextKey, Context, Result, ContextDependenciesKeys>
  ): ExecutionManager<Context & Record<ContextKey, Awaited<Result>>> {
    if (execution.contextDependencies) {
      const dependenciesLevel: Array<number> = [];
      execution.contextDependencies.forEach((contextDependency: string) => {
        const executionsWithLevel = Object.entries(this.executionsByLevel);
        for (const [level, executions] of executionsWithLevel) {
          const foundDependency = executions.find(
            (item) => item.contextKey === contextDependency
          );

          if (foundDependency) {
            dependenciesLevel.push(+level);
          }
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
        executionInLevel.map((execution) => execution.call(this.context as any))
      );

      for (const [index, response] of responses.entries()) {
        (this.context as BaseContext)[executionInLevel[index].contextKey] =
          response;
      }
    }

    return this.context as unknown as Promise<Context>;
  }
}
