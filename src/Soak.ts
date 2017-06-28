export type Soak<State, Action> = <State, Action>(state: State, action: Action) => Pick<State, keyof State>;
export type FullSoak<State, Action> = <State, Action>(state: State, action: Action) => State;

export const completeSoak = <State, Action>(soak: Soak<State, Action>): FullSoak<State, Action> => {
    return (state: State, action: Action) => {
        const partial = soak(state, action);
        return (partial === undefined || partial === {})
            ? state
            : Object.assign({}, state, partial);
    };
};

export const combineSoaks = <State, Action>(...soaks: (Soak<State, Action>)[]): Soak<State, Action> => {
    return (state: State, action: Action) => {
        const partials = soaks
            .map(fn => fn(state, action))
            .filter(partial => partial !== undefined && partial !== {});
        return Object.assign({}, ...partials);
    };
};

export type SoakMapObject<State, Action> = {
    [key: string]: Soak<State, Action>;
};

export type ParentState<SoakMap extends SoakMapObject<State, Action>, State, Action> = {
    [Param in keyof SoakMap]: State;
};