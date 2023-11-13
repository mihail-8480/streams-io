import {
  ISubject,
  Subscriber,
  createSubject,
  createSubscriber,
} from "@mojsoski/streams";

export type IReadStream = ISubject<Uint8Array>;
export type IWriteStream = Subscriber<Uint8Array>;

export type Writable = {
  write(item: Uint8Array): unknown;
  end(): unknown;
};

type ReadableParams<T extends "data" | "end"> = T extends "data"
  ? [Uint8Array]
  : [];

export type Readable = {
  on: <T extends "data" | "end">(
    ev: T,
    cb: (...params: ReadableParams<T>) => void
  ) => void;
};

export function subscriberFromWriteStream(
  stream: Writable,
  closeEof: boolean = true
): IWriteStream {
  return createSubscriber({
    end() {
      if (closeEof) {
        stream.end();
      }
    },
    data(item) {
      stream.write(item);
    },
  });
}

export function subjectFromReadStream(stream: Readable): IReadStream {
  const { close, notify, subject } = createSubject<Uint8Array>();
  stream.on("data", (data) => {
    notify(new Uint8Array(data));
  });
  stream.on("end", () => {
    close();
  });

  return subject;
}
