
/**
 * A function that creates an action object.
 */
export type ActionCreator<A> = (...params: any[]) => A;

/**
 * A map of acion creator functions
 */
export type ActionCreatorMap<A> = {
    [key: string]: ActionCreator<A>;
};

/**
 * Takes a dispatch function and action creator function and returns a function that will
 * dispatch the action before returning it.
 * @param fn action creator function
 * @param dispatch dispatch function
 */
export function wrapActionCreator<T extends ActionCreator<A>, A>(fn: T, dispatch: (action: A) => void): T {
    var wrappedActionCreator = (...args: any[]) => {
        const action = fn(...args);
        dispatch(action);
        return action;
    };
    return wrappedActionCreator as T;
}

/**
 * Takes a dispatch function and a map of action creator functions and returns a
 * map of functions that will dispatch the action before returning the action.
 * @param map a map of action creator functions
 * @param dispatch the function to use to dispatch the action.
 */
export function wrapActionCreatorMap<T extends ActionCreatorMap<A>, A>(map: T, dispatch: (action: A) => void): T {
    const keys = Object.keys(map);
    const boundActionCreators: ActionCreatorMap<A> = {};
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const actionCreator = map[key];
        boundActionCreators[key] = wrapActionCreator(actionCreator, dispatch);
    }
    return boundActionCreators as T;
}