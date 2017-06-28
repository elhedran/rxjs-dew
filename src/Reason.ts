export type Reason<S, A> = <S, A>(state: S, action: A) => Pick<S, keyof S>;
export type CompleteReason<S, A> = <S, A>(state: S, action: A) => S;

export const completeReason = <S, A>(reason: Reason<S, A>): CompleteReason<S, A> => {
    return (s: S, a: A) => {
        return Object.assign(s, reason(s, a));
    };
};

export const combineReasons = <S, A>(...reasons: (Reason<S, A>)[]): Reason<S, A> => {
    return (state: S, action: A) => {
        const partials = reasons
            .map(fn => fn(state, action))
            .filter(p => p !== undefined && p !== {});
        return Object.assign({}, ...partials);
    };
};

export type ReasonMapObject<S, A> = {
    [key: string]: Reason<S, A>;
};

export type ParentState<R extends ReasonMapObject<S, A>, S, A> = {
    [P in keyof R]: S;
};

/* example

type State = { count: number; };

const reason: Reason<State, number> = (state = { count: 0} , action: number) => state;
const reasonMap = {
    counter: reason
};

export type RP = ParentState<typeof reasonMap, State, number>;

*/