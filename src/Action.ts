
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
 * The Union of an ActionCreatorMap for action type any.
 * 
 * This is used to define an Action type from a creator map.
 */
export type ActionCreatorMapUnion<A extends ActionCreatorMap<any>> = ReturnType<A[keyof A]>

/**
 * Creates an empty Action type.  Can be used as the basis in a spread operator.
 * 
 * e.g.
 * enum ActionType {
 *      Foo = 'FOO'
 * }
 * 
 * const creators = {
 *   foo: (a: number, b: string) => ({ ...createAction(ActionType.Foo), a, b })
 * }
 * 
 * This is a convenience for;
 * 
 * const creators = {
 *  foo: (a: number, b: string) => ({ ActionType.Foo as ActionType.Foo, a, b })}
 * 
 * @param type is the type value for the action. Must be of type string for this function.
 */
export const createAction = <T extends string>(type: T) => ({ type });

/**
 * 
 * @param type is the type to test for
 * @param func is the function that defines the return type for the action type.
 */
export const isAction = <T, F extends ActionCreator<any>>(type: T, func: F) =>
    <A extends { type: T }>(a: A): a is ReturnType<F> => a.type === type

/**
 * Takes a dispatch function and action creator function and returns a function that will
 * dispatch the action before returning it.
 * @param fn action creator function
 * @param dispatch dispatch function
 */
export function bindActionCreator<T extends ActionCreator<A>, A>(fn: T, dispatch: (action: A) => void): T {
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
export function bindActionCreatorMap<T extends ActionCreatorMap<A>, A>(map: T, dispatch: (action: A) => void): T {
    const keys = Object.keys(map);
    const boundActionCreators: ActionCreatorMap<A> = {};
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const actionCreator = map[key];
        boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
    return boundActionCreators as T;
}