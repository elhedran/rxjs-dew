import { Observable } from 'rxjs';

export type Ream<A> = <A>(in$: Observable<A>) => Observable<A>;

export const combineReams = <A>(...epics: Ream<A>[]): Ream<A> => {
    var result = (next: Observable<A>) => {
        const share$ = next.share();
        return Observable.merge(
            ...epics.map(fn => fn(share$))
        );
    };

    return result;
};

// tslint:disable-next-line:no-any
export const passThrough: Ream<any> = <A>(in$: Observable<A>) => in$;