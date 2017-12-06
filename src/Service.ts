import { Store } from './Store';
import { ActionCreatorMap, bindActionCreator } from './Action';

/**
 * Takes a store and a map of action creator functions and
 * returns a combined object of both the store and
 * bound actions that when called apply actions directly
 * onto the dispatch of the store.
 * @param map a map of action creator functions
 * @param store a set of business logic for managing actions and state.
 */
export function createService<T extends ActionCreatorMap<A>, A, S>(
    map: T,
    store: Store<S, A>
): Store<S, A> & T
{
    const keys = Object.keys(map);
    const boundActionCreators: ActionCreatorMap<A> = {};
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const actionCreator = map[key];
        boundActionCreators[key] = bindActionCreator(
            actionCreator,
            (action: A) => store.dispatch$.next(action)
        );
    }
    return {
        ...boundActionCreators,
        ...store
     } as Store<S, A> & T;
}