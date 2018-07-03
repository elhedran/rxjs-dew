import { Flow, flowThrough } from './Flow';
import { Soak } from './Soak';
import {
    Observable, Subject, ReplaySubject,
    concat, of, empty
} from 'rxjs';
import {
    share, scan, distinctUntilChanged
} from 'rxjs/operators'

/**
 * The dispatch and state that comprises a dw Store.
 */
export type Store<State, Action> = {
    /** dispatch actions into the store */
    dispatch$: Subject<Action>;
    /** observable of actions after flows applied */
    action$: Observable<Action>
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
    flow?: Flow<Action>,
    soak?: Soak<State, Action>,
    initialState?: State
): Store<State, Action> => {
    // insert
    const subject$ = new Subject<Action>();
    // flow
    const action$ = (flow ? flow(subject$) : flowThrough<Action>(subject$)).pipe(share());
    // soak
    const scan$ = soak ? action$.pipe(scan<Action, State>(soak, initialState)) : empty();
    // state
    const initialState$ = initialState ? of(initialState) : empty();
    const state$ = concat(initialState$, scan$)
        .pipe(distinctUntilChanged());
    const replay$ = new ReplaySubject<State>(1);
    state$.subscribe(state => replay$.next(state));

    const store = {
        dispatch$: subject$,
        action$: action$,
        state$: replay$
    };
    // empty action through to trigger any initial states.
    return store;
};

export default createStore;