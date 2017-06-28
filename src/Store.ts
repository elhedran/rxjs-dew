import { Flow } from './Flow';
import { Soak, completeSoak } from './Soak';
import { Observable, Subject } from 'rxjs';

export type Store<S, A> = {
    dispatch$: Subject<A>;
    state$: Observable<S>;
};

export const createStore = <S, A>(flow: Flow<A>, soak: Soak<S, A>, initialState?: S): Store<S, A> => {
    const subject$ = new Subject<A>();
    const cr = completeSoak(soak);
    return {
        dispatch$: subject$,
        state$: flow(subject$).scan<A, S>(cr, initialState).share()
    };
};

export default createStore;