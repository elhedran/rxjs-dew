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

Neither `Action` nor `State` are an explicit type in Dew. They only exist as a
way of keeping type consistency between Dew functions and classes.  Ideally
both should be plain old data.

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
export declare type Store<State, Action> = {
    dispatch$: Subject<Action>;
    action$: Observable<Action>;
    state$: Observable<State>;
};
```

A `Store` has a `dispatch$` to insert new actions, an `action$` observable of
the actions after the flows have been applied, and a `state$` observable of
the state after the soaks have been applied.

This can be either created manually or using the convenience function `createStore`

```typescript
export declare const createStore: <State, Action>(
  flow?: Flow<Action> | undefined,
  soak?: Soak<State, Action> | undefined,
  initialState?: State | undefined) => Store<State, Action>;

```

Each parameter is optional.  If a `flow` is provided actions will be changed by
the flow before being soaked into the state.  If a `soak` is provided this will
be used to apply actions to the state otherwise the state is unchanged by actions.
If an `initialState` is provided this will be provided both to the soak and
as an initial change to state, otherwise state will not be changed until the
first action is passed.

Note, if no initial state is set then any subscribers will not be called until
an action is dispatched. Likewise if no soak is set then only the initial state,
if provided, will be called upon subscribers.