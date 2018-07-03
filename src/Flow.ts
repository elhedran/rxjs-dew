import { Observable, merge } from 'rxjs';
import { filter, share } from 'rxjs/operators';
/**
 * A Flow describes how a stream of program actions is transformed over time.
 * This allows for actions to trigger other actions, be debounced, or passed
 * through as is before being applied to a state object.
 * 
 * @param in$ an Observable of actions to be transformed.
 */
export type Flow<Action> = (in$: Observable<Action>) => Observable<Action>;

/**
 * Guards a flow with a type guard so it can be used with any action type.
 * @param flow the flow to transform
 * @param guard the type guard to ensure the action is suitable for the soak
 */
export const guardFlow = <Action>(flow: Flow<Action>, guard: (action: any) => action is Action): Flow<any> => {
    return (in$: Observable<any>) => in$.pipe(filter(guard))
}

/**
 * Takes a set of flows and combines them into a single flow. The input stream
 * of actions is shared over the set of flows and the result merged back together
 * for the output.
 * 
 * Does not pass the stream through so if none of the flows passed pass an
 * action through it will not appear in the output.  See the helper flow `flowThrough`.
 * 
 * @param flows Set of flows to combine
 */
export const combineFlows = <Action>(...flows: Flow<Action>[]): Flow<Action> => {
    var result = (next: Observable<Action>) => {
        const share$ = next.pipe(share());
        return merge(
            ...flows.map(fn => fn(share$))
        );
    };

    return result;
};

/**
 * A convenience flow that passes an action stream through unmodified to be used with
 * combineFlows when required.
 * 
 * @param in$ an Observable of actions to be transformed.
 */
export function flowThrough<Action>(in$: Observable<Action>) { return in$ };