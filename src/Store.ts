import { Flow } from './Flow';
import { Soak, completeSoak } from './Soak';
import { Observable, Subject } from 'rxjs';

export type Store<State, Action> = {
    dispatch$: Subject<Action>;
    state$: Observable<State>;
};

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