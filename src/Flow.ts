import { Observable } from 'rxjs';

export type Flow<Action> = <Action>(in$: Observable<Action>) => Observable<Action>;

export const combineFlows = <Action>(...flows: Flow<Action>[]): Flow<Action> => {
    var result = (next: Observable<Action>) => {
        const share$ = next.share();
        return Observable.merge(
            ...flows.map(fn => fn(share$))
        );
    };

    return result;
};

// tslint:disable-next-line:no-any
export const flowThrough: Flow<any> = <Action>(in$: Observable<Action>) => in$;