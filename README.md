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

### Flow

```
type Flow<Action> = <Action>(in$: Observable<Action>) => Observable<Action>;
```

A flow transforms a stream of actions. It may delay some actions, debounce
others, or use some to trigger future events.  The simplest flow is
`flowThrough` which is also provided by the library for convenience.

```
const flowThrough: Flow<any> = <Action>(in$: Observable<Action>) => in$;
```

However a more useful flow might be to watch for change actions, debounce them
and then map them to a save action.

```
const debounceSave = (in$: Observable<MyActions>) =>
    in$.filter(action => action.type == 'change')
        .debounce(500 /*ms*/)
        .map(action => { type: 'save', payload: action.payload });
```

Flows can also be combined.

```
const combineFlows = <Action>(...flows: Flow<Action>[]): Flow<Action>
```

Which is a convenience function for sharing the input stream over a set
of flows and then merging the output of those flows to the output stream. The
earlier debounceSave is a blocking flow in that it doesn't allow any actions it
doesn't filter for through, so its best to combine it with the flow through.

```
const flow = combineFlows(debounceSave, flowThrough);
```

### Soak

```
type Soak<State, Action> = <State, Action>(state: State, action: Action) => Pick<State, keyof State>;
```

A transforms part of a state based on an action.  If an action would no change
the state a soak should returned `undefined`.

TODO

### Store
