<img title="logo" src="logo/logo.png" style="{width: 20em; height: 20em;}">

# RxJs Dew

This project is born out of an appreciation of redux, but a love of RxJS and
TypeScript. It isn't a port or wrapping of redux with RxJS, its a fresh start
with some additional goals.

- *No project specific internals* - The project leverages RxJS Observables and
  has no additional internal members on its types.  That means for any Dew
  type passed to a Dew function or gotten back from a Dew function can be
  constructed separately to match the interface, no middleware required.
- *TypeScript first* - If TypeScript helps solve a problem use the TypeScript
  approach. This means leveraging descriminated unions for type safety and
  readonly types and properties for immutability.
- *Async by default* - Because Apps sometimes have to wait or act over time.
- *Composable* - As much as possible types should be composable such that
  complex functionality can be built by combining simpler functionality.

## Types

### Action & State

Neither `Action` nor `State` are an explicit type in Dew. They only exist as a way of keeping type consistency between Dew functions and classes.  Ideally both should be plain old data.

### Flow

```typescript
type Flow<Action> = <Action>(in$: Observable<Action>) => Observable<Action>;
```

A flow transforms a stream of actions. It may delay some actions, debounce
others, or use some to trigger future events.  The simplest flow is
`flowThrough` which is also provided by the library for convenience.

```typescript
const flowThrough: Flow<any> = <Action>(in$: Observable<Action>) => in$;
```

However a more useful flow might be to watch for change actions, debounce them
and then map them to a save action.

```typescript
const debounceSave = (in$: Observable<MyActions>) =>
    in$.filter(action => action.type == 'change')
        .debounce(500 /*ms*/)
        .map(action => { type: 'save', payload: action.payload });
```

Flows can also be combined.

```typescript
const combineFlows = <Action>(...flows: Flow<Action>[]): Flow<Action>
```

Which is a convenience function for sharing the input stream over a set
of flows and then merging the output of those flows to the output stream. The
earlier debounceSave is a blocking flow in that it doesn't allow any actions it
doesn't filter for through, so its best to combine it with the flow through.

```typescript
const flow = combineFlows(debounceSave, flowThrough);
```

### Soak

```typescript
type Soak<State, Action> = <State, Action>(state: State, action: Action) => Pick<State, keyof State>;
```

A transforms part of a state based on an action.  If an action would no change
the state a soak should returned `undefined`.

### Store

```typescript
export type Store<State, Action> = {
    dispatch$: Subject<Action>;
    state$: Observable<State>;
};
```

The store is quite simply a `Flow` of `Actions` that are subscribed to a scan of `Soaks` on the the `State`. The result is a `dispatch$` property that can be used to add actions into the flow and a `state$` observer that can be subscribed to react to
state changes. As such there is no middleware it is simply a type
definition with no private data or functions.