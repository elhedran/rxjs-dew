/**
 * Applies the action to the state returning the modified part of the state, or undefined if state is unmodified.
 * 
 * *Note, any undefined values will not be applied to state.  If the soak needs to set some fields to
 * undefined use a full soak*
 */
export type PartialSoak<State, Action> = (state: Readonly<State>, action: Readonly<Action>) => Partial<State> | undefined;

/**
 * Applies the action to the state returning the full state if modified or the original state if unmodified.
 */
export type Soak<State, Action> = (state: Readonly<State>, action: Readonly<Action>) => State;

/**
 * Convenience function to transform a partial soak function into a full soak function.
 * 
 * @param soak the soak function to transform.
 */
export const completeSoak = <State, Action>(soak: PartialSoak<State, Action>): Soak<State, Action> => 
    (state: State, action: Action) => {
        const partial = soak(state, action);
        if (partial === undefined) {
            return state;
        }
        var result = Object.assign({}, state);
        Object.keys(partial).forEach(k => result[k] = partial[k] === undefined ? result[k] : partial[k])
        return result;
    };

/**
 * Guards a soak with a type guard so it can be used with any action type.
 * @param soak the soak function to transform
 * @param guard the type guard to ensure the action is suitable for the soak
 */
export const guardSoak = <State, Action>(soak: Soak<State, Action>, guard: (action: any) => action is Action): Soak<State, any> => 
    (state: State, action: any) => guard(action) ? soak(state, action) : state;


/**
 * Combines a set of soak functions into a single soak function. Any partial soak that returns undefined will
 * not affect the state.  If all soaks return undefined the combined soak will also return undefined.
 * 
 * @param soaks the soaks to combine.
 */
export const combineSoaks = <State, Action>(...soaks: (Soak<State, Action>)[]): Soak<State, Action> => 
    (state: State, action: Action) => {
        var next = state;
        soaks.forEach(soak => {
            var change = soak(next, action);
            if (change !== undefined)
                next = change;
        })
        return next;
    };