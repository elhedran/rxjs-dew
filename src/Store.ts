import { Flow } from './Flow';
import { Soak, completeSoak } from './Soak';
import { Observable, Subject } from 'rxjs';

/**
 * The dispatch and state that comprises a dw Store.
 */
export type Store<State, Action> = {
    dispatch$: Subject<Action>;
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
    flow: Flow<Action>,
    soak: Soak<State, Action>,
    initialState?: State
): Store<State, Action> => {
    const subject$ = new Subject<Action>();
    const fullSoak = completeSoak(soak);
    return {
        dispatch$: subject$,
        state$: flow(subject$).scan<Action, State>(fullSoak, initialState).share()
    };
};

export default createStore;