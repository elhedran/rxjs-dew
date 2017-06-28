export type Soak<S, A> = <S, A>(state: S, action: A) => Pick<S, keyof S>;
export type FullSoak<S, A> = <S, A>(state: S, action: A) => S;

export const completeSoak = <S, A>(soak: Soak<S, A>): FullSoak<S, A> => {
    return (s: S, a: A) => {
        const partial = soak(s, a);
        return (partial === undefined || partial === {})
            ? s
            : Object.assign({}, s, partial);
    };
};

export const combineSoaks = <S, A>(...soaks: (Soak<S, A>)[]): Soak<S, A> => {
    return (state: S, action: A) => {
        const partials = soaks
            .map(fn => fn(state, action))
            .filter(p => p !== undefined && p !== {});
        return Object.assign({}, ...partials);
    };
};

export type SoakMapObject<S, A> = {
    [key: string]: Soak<S, A>;
};

export type ParentState<R extends SoakMapObject<S, A>, S, A> = {
    [P in keyof R]: S;
};