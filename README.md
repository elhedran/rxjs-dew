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

Additionally while it is recommended that actions have a `type` field and that this
type field derives from string, this is not required. The only functions that place
a requirement on type are:

* `createAction`: `type` passed must extend string
* `isAction`: created functions `action` must have a `type` property of the same type
  as the `type` parameter used to create the function.

### Flow

```typescript
type Flow<Action> = (in$: Observable<Action>) => Observable<Action>;
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
    in$.pipe(
      filter(action => action.type == 'change'),
      debounce(500 /*ms*/),
      map(action => { type: 'save', payload: action.payload })
    );
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
type Soak<State, Action> = (state: Readonly<State>, action: Readonly<Action>) => Partial<State, keyof State> | undefined;
```

A transforms part of a state based on an action.  If an action would no change
the state a soak should returned `undefined`.

### Store

```typescript
declare type Store<State, Action> = {
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
declare const createStore: <State, Action>(
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

### Utilities

#### createAction, isAction, and ActionCreatorMapUnion

With typescript 2.8 and `ReturnType<F>` it is now easier to define actions base of the
creator map.  This pattern can be used as;

```typescript

export enum ActionType {
    SignIn = 'SignIn',
    SignOut = 'SignOut',
}

export const creators = {
    signIn: () => createAction(ActionType.SignIn),
    signOut: (next: number) => ({ ...createAction(ActionType.SignOut), next })
};

export type Action = ActionCreatorMapUnion<typeof creators>;
```

Additionally this pattern can also be used in defining action filters which will perform
type narrowing suitable for using with `rxjs` filter.

```typescript
export const filters = {
    isSignIn: isAction(ActionType.SignIn, creators.signIn),
    isSignOut: isAction(ActionType.SignOut, creators.signOut)
};

function doAction(a: Action) {
  return a.next; // compile error, a may not have a next;
  if (filters.isSignOut(a)) {
    return a.next; // compiles, isSignOut narrowed type.
  }
}
```

#### bindActionCreator

Allows binding a function that creates an action to a function that dispatches that
action, returning a function that both creates and dispatches the action.

```typescript
function bindActionCreator<T extends ActionCreator<A>, A>(fn: T, dispatch: (action: A) => void): T;
```

#### bindActionCreatorMap

Allows binding a map of functions that create actions to a function that dispatches
an an action of the same type, returning a map of functions that both create and
dispatch the action.

```typescript
type ActionCreatorMap<A> = {
    [key: string]: ActionCreator<A>;
};

function bindActionCreatorMap<T extends ActionCreatorMap<A>, A>(map: T, dispatch: (action: A) => void): T;
```

#### creatService

As a convienience there is also the `createService` function which binds an action
creator map directly to a store.  The object returned is a copy of the store with
refrences to its `dispatch$`, `action$` and `$state` members, but with additional
bound functions based on action creators that will push the respective actions
onto the store's `dispatch$`. This service can then be used reducing the need for
users of the store to bind actions themeselves.

```typescript
export function createService<T extends ActionCreatorMap<A>, A, S>(
    map: T,
    store: Store<S, A>
): Store<S, A> & T;
```