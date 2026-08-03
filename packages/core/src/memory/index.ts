import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { SessionError } from "../errors/index.js";
import type { Message } from "../types/index.js";
export interface Session {
  id: string;
  messages: Message[];
  metadata: Record<string, unknown>;
  state?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  version: number;
  expiresAt?: string;
}
export interface SessionStore {
  create(
    id: string,
    initial?: Partial<Pick<Session, "metadata" | "state">>,
  ): Promise<Session>;
  get(id: string): Promise<Session | undefined>;
  appendMessages(
    id: string,
    messages: Message[],
    expectedVersion?: number,
  ): Promise<Session>;
  updateMetadata(
    id: string,
    metadata: Record<string, unknown>,
  ): Promise<Session>;
  save(session: Session): Promise<void>;
  delete(id: string): Promise<void>;
  list(): Promise<Session[]>;
}
export class InMemorySessionStore implements SessionStore {
  private sessions = new Map<string, Session>();
  constructor(
    private readonly options: { maxMessages?: number; ttlMs?: number } = {},
  ) {}
  async create(
    id: string,
    initial: Partial<Pick<Session, "metadata" | "state">> = {},
  ) {
    const now = new Date().toISOString();
    const session: Session = {
      id,
      messages: [],
      metadata: initial.metadata ?? {},
      createdAt: now,
      updatedAt: now,
      version: 0,
      ...(initial.state ? { state: initial.state } : {}),
      ...(this.options.ttlMs
        ? { expiresAt: new Date(Date.now() + this.options.ttlMs).toISOString() }
        : {}),
    };
    this.sessions.set(id, structuredClone(session));
    return structuredClone(session);
  }
  async get(id: string) {
    const value = this.sessions.get(id);
    if (!value) return undefined;
    if (value.expiresAt && Date.parse(value.expiresAt) <= Date.now()) {
      this.sessions.delete(id);
      return undefined;
    }
    return structuredClone(value);
  }
  async appendMessages(
    id: string,
    messages: Message[],
    expectedVersion?: number,
  ) {
    const session = await this.require(id);
    if (expectedVersion !== undefined && session.version !== expectedVersion)
      throw new SessionError("Session version conflict");
    session.messages.push(...structuredClone(messages));
    if (
      this.options.maxMessages &&
      session.messages.length > this.options.maxMessages
    )
      session.messages = session.messages.slice(-this.options.maxMessages);
    session.version++;
    session.updatedAt = new Date().toISOString();
    await this.save(session);
    return session;
  }
  async updateMetadata(id: string, metadata: Record<string, unknown>) {
    const session = await this.require(id);
    session.metadata = { ...session.metadata, ...structuredClone(metadata) };
    session.version++;
    session.updatedAt = new Date().toISOString();
    await this.save(session);
    return session;
  }
  async save(session: Session) {
    this.sessions.set(session.id, structuredClone(session));
  }
  async delete(id: string) {
    this.sessions.delete(id);
  }
  async list() {
    return [...this.sessions.values()].map((x) => structuredClone(x));
  }
  protected async require(id: string) {
    const session = await this.get(id);
    if (!session) throw new SessionError(`Session ${id} not found`);
    return session;
  }
}
export class FileSessionStore extends InMemorySessionStore {
  private loaded = false;
  private readonly file: string;
  constructor(
    directory: string,
    options: { maxMessages?: number; ttlMs?: number } = {},
  ) {
    super(options);
    const root = resolve(directory);
    this.file = join(root, "sessions.json");
    if (!this.file.startsWith(root))
      throw new SessionError("Unsafe session path");
  }
  private async load() {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const sessions = JSON.parse(
        await readFile(this.file, "utf8"),
      ) as Session[];
      for (const session of sessions) await super.save(session);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT")
        throw new SessionError("Session file is corrupt or unreadable");
    }
  }
  private async flush() {
    await mkdir(resolve(this.file, ".."), { recursive: true });
    const temporary = `${this.file}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(await super.list(), null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });
    await rename(temporary, this.file);
  }
  override async create(id: string, initial = {}) {
    await this.load();
    const session = await super.create(id, initial);
    await this.flush();
    return session;
  }
  override async get(id: string) {
    await this.load();
    return super.get(id);
  }
  override async save(session: Session) {
    await this.load();
    await super.save(session);
    await this.flush();
  }
  override async delete(id: string) {
    await this.load();
    await super.delete(id);
    await this.flush();
  }
  override async list() {
    await this.load();
    return super.list();
  }
}
export class ContextManager {
  constructor(private readonly maxMessages = 50) {}
  select(session: Session): Message[] {
    return session.messages.slice(-this.maxMessages);
  }
}
