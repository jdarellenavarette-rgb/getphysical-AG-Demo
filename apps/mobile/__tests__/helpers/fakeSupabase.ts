/**
 * A stand-in for the Supabase client that records what the app asks for and
 * answers from canned rows, so the member ↔ venue flows can be exercised
 * without a network. It applies `eq` and `in` filters like PostgREST does.
 */
type Row = Record<string, unknown>;
type Reply = { data: unknown; error: { message: string; code?: string } | null };

export interface RecordedQuery {
  table: string;
  columns: string;
  filters: { op: string; column: string; value: unknown }[];
  orderBy: string[];
}

export interface FakeBackend {
  /** Rows per table. */
  tables: Record<string, Row[]>;
  /** Answers per RPC name. */
  rpc: Record<string, (args: Record<string, unknown>) => Reply>;
  /** Tables that answer with an error instead of rows. */
  failing: Record<string, string>;
  userId: string | null;
  /** Everything asked so far. */
  queries: RecordedQuery[];
  rpcCalls: { name: string; args: Record<string, unknown> }[];
}

export function createFakeBackend(initial: Partial<FakeBackend> = {}): FakeBackend {
  return { tables: {}, rpc: {}, failing: {}, userId: "user-1", queries: [], rpcCalls: [], ...initial };
}

class FakeQuery implements PromiseLike<Reply> {
  private readonly query: RecordedQuery;
  private single = false;
  private max: number | null = null;

  constructor(
    private readonly backend: FakeBackend,
    table: string,
  ) {
    this.query = { table, columns: "", filters: [], orderBy: [] };
    backend.queries.push(this.query);
  }

  select(columns: string) {
    this.query.columns = columns;
    return this;
  }
  eq(column: string, value: unknown) {
    this.query.filters.push({ op: "eq", column, value });
    return this;
  }
  in(column: string, value: unknown[]) {
    this.query.filters.push({ op: "in", column, value });
    return this;
  }
  not(column: string, operator: string, value: unknown) {
    this.query.filters.push({ op: `not.${operator}`, column, value });
    return this;
  }
  order(column: string) {
    this.query.orderBy.push(column);
    return this;
  }
  limit(count: number) {
    this.max = count;
    return this;
  }
  maybeSingle() {
    this.single = true;
    return this;
  }

  private run(): Reply {
    const failure = this.backend.failing[this.query.table];
    if (failure) return { data: null, error: { message: failure } };
    let rows = (this.backend.tables[this.query.table] ?? []).filter((row) =>
      this.query.filters.every((f) => {
        if (f.op === "eq") return row[f.column] === f.value;
        if (f.op === "in") return (f.value as unknown[]).includes(row[f.column]);
        if (f.op === "not.is") return row[f.column] !== f.value;
        return true;
      }),
    );
    for (const column of [...this.query.orderBy].reverse()) {
      rows = [...rows].sort((a, b) => (Number(a[column]) || 0) - (Number(b[column]) || 0));
    }
    if (this.max !== null) rows = rows.slice(0, this.max);
    return { data: this.single ? (rows[0] ?? null) : rows, error: null };
  }

  then<A = Reply, B = never>(
    onfulfilled?: ((value: Reply) => A | PromiseLike<A>) | null,
    onrejected?: ((reason: unknown) => B | PromiseLike<B>) | null,
  ): PromiseLike<A | B> {
    return Promise.resolve(this.run()).then(onfulfilled, onrejected);
  }
}

/** The subset of the Supabase client the member and venue services use. */
export function createFakeClient(backend: FakeBackend) {
  return {
    from: (table: string) => new FakeQuery(backend, table),
    rpc: (name: string, args: Record<string, unknown> = {}) => {
      backend.rpcCalls.push({ name, args });
      const handler = backend.rpc[name];
      return Promise.resolve<Reply>(handler ? handler(args) : { data: null, error: { message: `no rpc ${name}` } });
    },
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: backend.userId ? { user: { id: backend.userId } } : null } }),
    },
  };
}
