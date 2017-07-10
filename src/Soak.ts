/**
 * Applies the action to the state returning the modified part of the state, or undefined if state is unmodified.
 */
export type Soak<State, Action> = <State, Action>(state: State, action: Action) => Pick<State, keyof State> | undefined;

/**
 * Applies the action to the state returning the full state if modified or the original state if unmodified.
 */
export type FullSoak<State, Action> = <State, Action>(state: State, action: Action) => State;

/**
 * Convenience function to transform a partial soak function into a full soak function.
 * 
 * @param soak the soak function to transform.
 */
export const completeSoak = <State, Action>(soak: Soak<State, Action>): FullSoak<State, Action> => {
    return (state: State, action: Action) => {
        const partial = soak(state, action);
        return (partial === undefined || partial === {})
            ? state
            : Object.assign({}, state, partial);
    };
};

/**
 * Combines a set of soak functions into a single soak function. Any partial soak that returns undefined will
 * not affect the state.  If all soaks return undefined the combined soak will also return undefined.
 * 
 * @param soaks the soaks to combine.
 */
export const combineSoaks = <State, Action>(...soaks: (Soak<State, Action>)[]): Soak<State, Action> => {
    return (state: State, action: Action) => {
        const partials = soaks
            .map(fn => fn(state, action))
            .filter(partial => partial !== undefined && partial !== {});
        if (partials.length === 0) return undefined;
        return Object.assign({}, ...partials);
    };
};

/**
 * An object mapping a string key to a Soak.  Allows composing soaks by partitioned key.
 */
export type SoakMapObject<State, Action> = {
    [key: string]: Soak<State, Action>;
};

/**
 * Convenience type to define a Parent state for a Soak based of the Soak Map object such that
 * the keys for the state in the parent state matches that used for the soak in the soak map object.
 */
export type ParentState<SoakMap extends SoakMapObject<State, Action>, State, Action> = {
    [Param in keyof SoakMap]: State;
};