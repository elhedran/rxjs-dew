import { Observable } from 'rxjs';

export type Flow<A> = <A>(in$: Observable<A>) => Observable<A>;

export const combineFlows = <A>(...flows: Flow<A>[]): Flow<A> => {
    var result = (next: Observable<A>) => {
        const share$ = next.share();
        return Observable.merge(
            ...flows.map(fn => fn(share$))
        );
    };

    return result;
};

// tslint:disable-next-line:no-any
export const flowThrough: Flow<any> = <A>(in$: Observable<A>) => in$;