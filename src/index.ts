export * from './Ream';
export * from './Reason';

import { Ream } from './Ream';
import { Reason, completeReason } from './Reason';
import { Observable, Subject } from 'rxjs';

export type Store<S, A> = {
    dispatch$: Subject<A>;
    state$: Observable<S>;
};

export const createStore = <S, A>(ream: Ream<A>, reason: Reason<S, A>, initial?: S): Store<S, A> => {
    const subject$ = new Subject<A>();
    const cr = completeReason(reason);
    return {
        dispatch$: subject$,
        state$: ream(subject$).scan<A, S>(cr, initial).share()
    };
};

export default createStore;