import { createAction, isAction, ActionCreatorMapUnion, bindActionCreator, bindActionCreatorMap } from './Action';

export enum ActionType {
    SignIn = 'SignIn',
    SignOut = 'SignOut',
}

export namespace Action {
    export const creators = {
        signIn: () => createAction(ActionType.SignIn),
        signOut: (next: number) => ({ ...createAction(ActionType.SignOut), next })
    }

    export const filters = {
        isSignIn: isAction(ActionType.SignIn, creators.signIn),
        isSignOut: isAction(ActionType.SignOut, creators.signOut)
    }
}

type Action = ActionCreatorMapUnion<typeof Action.creators>;

describe('createAction', () => {
    it('it should narrow type property', () => {
        let action = Action.creators.signOut(5);
        expect(Action.filters.isSignOut(action)).toBe(true)
        action.next == 5;
    });
});

describe('isAction', () => {
    it('should work on non-string types', () => {
        let a = () => ({ type: 5 as 5 })
        let b = () => ({ type: 6 as 6, next: 2 })
        let isA = isAction(5, a);
        let isB = isAction(6, b);

        expect(isA(a())).toBe(true);
        expect(isA(b())).toBe(false);
        expect(isB(a())).toBe(false);
        expect(isB(b())).toBe(true);
    })
});

describe('dynamic creator map', () => {
    it('can be bound', () => {
        let count = 0;
        let bound = bindActionCreatorMap(
            Action.creators, (a: Action) => { count++; }
        );
        bound.signIn();
        expect(count).toBe(1);
    });
});