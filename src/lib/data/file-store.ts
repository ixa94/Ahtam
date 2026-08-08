import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const writeQueues = new Map<string, Promise<void>>();

function resolveDataFile(filename: string): string {
  if (path.basename(filename) !== filename || !/^[a-z0-9-]+\.json$/i.test(filename)) {
    throw new Error("Invalid data filename");
  }
  return path.join(DATA_DIR, filename);
}

export async function readJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(resolveDataFile(filename), "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const destination = resolveDataFile(filename);
  const temporary = `${destination}.${process.pid}.${Date.now()}.tmp`;
  await fs.mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
  await fs.writeFile(temporary, JSON.stringify(data, null, 2), { encoding: "utf-8", mode: 0o600 });
  await fs.rename(temporary, destination);
}

async function inWriteQueue<T>(filename: string, operation: () => Promise<T>): Promise<T> {
  const previous = writeQueues.get(filename) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  writeQueues.set(filename, current);

  await previous.catch(() => {});
  try {
    return await operation();
  } finally {
    release();
    if (writeQueues.get(filename) === current) writeQueues.delete(filename);
  }
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
  await inWriteQueue(filename, () => writeJsonFile(filename, data));
}

export async function updateJson<T>(filename: string, fallback: T, update: (current: T) => T): Promise<T> {
  return inWriteQueue(filename, async () => {
    const next = update(await readJson(filename, fallback));
    await writeJsonFile(filename, next);
    return next;
  });
}
