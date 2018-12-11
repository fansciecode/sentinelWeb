/*
This file maintains some stream helpers used in iov-bns, but which
may be useful other places, and should consider to be moved.

Reducer and related code works to maintain a current state
materialized by reducing all events on a stream. Similar
to ValueAndUpdate in keycontrol, but more general.
*/

// tslint:disable:readonly-keyword
// tslint:disable:no-object-mutation
import { Stream } from "xstream";

export type ReducerFunc<T, U> = (acc: U, evt: T) => U;

// Reducer takes a stream of events T and a ReducerFunc, that
// materializes a state of type U.
export class Reducer<T, U> {
  private readonly stream: Stream<T>;
  private readonly reducer: ReducerFunc<T, U>;
  private state: U;
  // completed maintains state of stream, resolves/rejects
  // on complete or error
  private readonly completed: Promise<void>;

  constructor(stream: Stream<T>, reducer: ReducerFunc<T, U>, initState: U) {
    this.stream = stream;
    this.reducer = reducer;
    this.state = initState;
    this.completed = new Promise<void>((resolve, reject) => {
      const subscription = this.stream.subscribe({
        next: (evt: T) => {
          this.state = this.reducer(this.state, evt);
        },
        complete: () => {
          resolve();
          // this must happen after resolve, to ensure stream.subscribe() has finished
          subscription.unsubscribe();
        },
        error: (err: any) => {
          reject(err);
          // the stream already closed on error, but unsubscribe to be safe
          subscription.unsubscribe();
        },
      });
    });
  }

  // value returns current materialized state
  public value(): U {
    return this.state;
  }

  // finished resolves on completed stream, rejects on stream error
  public finished(): Promise<void> {
    return this.completed;
  }
}

// countStream returns a reducer that contains current count
// of events on the stream
export function countStream<T>(stream: Stream<T>): Reducer<T, number> {
  return new Reducer(stream, counter, 0);
}
const counter: ReducerFunc<any, number> = (sum: number) => sum + 1;

// asArray maintains an array containing all events that have
// occurred on the stream
export function asArray<T>(stream: Stream<T>): Reducer<T, ReadonlyArray<T>> {
  return new Reducer(stream, append, []);
}
function append<T>(list: ReadonlyArray<T>, evt: T): ReadonlyArray<T> {
  return [...list, evt];
}

// lastValue returns the last value read from the stream, or undefined if no values sent
export function lastValue<T>(stream: Stream<T>): Reducer<T, T | undefined> {
  return new Reducer(stream, last, undefined);
}
function last<T>(_: any, evt: T): T {
  return evt;
}
