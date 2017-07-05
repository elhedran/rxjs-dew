import { Flow, flowThrough } from './Flow';
import { Soak, completeSoak } from './Soak';
import { Observable, Subject } from 'rxjs';

/**
 * The dispatch and state that comprises a dw Store.
 */
export type Store<State, Action> = {
    /** dispatch actions into the store */
    dispatch$: Subject<Action>;
    /** observable of actions after flows applied */
    flow$: Observable<Action>
    /** observable of state after flows and soaks applied */
    state$: Observable<State>;
};

/**
 * Links a flow, soak and initial state to create a store object.
 * Objects passed to the dispatch function will be filtered through the flow
 * then scanned to apply state changes defined by the soak, starting with the initial state.
 * 
 * @param flow the transformations to the action stream
 * @param soak the transformations to state based on actions
 * @param initialState  the initial state prior to any applied soaks.
 */
export const createStore = <State, Action>(
    flow: Flow<Action> = flowThrough,
    soak: Soak<State, Action>,
    initialState?: State
): Store<State, Action> => {
    // insert
    const subject$ = new Subject<Action>();
    // flow
    const flow$ = flow(subject$).share();
    // soak
    const fullSoak = completeSoak(soak);
    const scan$ = flow$.scan<Action, State>(fullSoak, initialState);
    // state
    const state$ = (initialState
        ? Observable.concat(Observable.of(initialState), scan$)
        : scan$).share();

    const store = {
        dispatch$: subject$,
        flow$: flow$,
        state$: state$
    };
    // empty action through to trigger any initial states.
    return store;
};

export default createStore;