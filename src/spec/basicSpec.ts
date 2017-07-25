import 'jasmine';
import { Soak, Flow } from '..';
import * as Rx from 'rxjs';

type CounterState = {
    counter: number;
};

const initialCounterState = {
    counter: 0
};

type CounterAction = {
    delta: number;
}

const counterSoak: Soak<CounterState, CounterAction> = (state, action) =>
    ({ counter: state.counter + action.delta });

const counterFlow: Flow<CounterAction> = (in$) =>
    in$.map(a => ({delta: a.delta*2}));

describe("soak modifies state", () => {
    const next = counterSoak(initialCounterState, { delta: 2});
    it('has changed', () => {
        expect(next.counter).toBe(2);
    })
});

describe("flow modifies actions", () => {
    var deltaList: number[];
    beforeEach(() => {
        const subject$ = new Rx.Subject<CounterAction>();
        const action$ = counterFlow(subject$);
        deltaList = [];
        action$.subscribe(a => deltaList.push(a.delta));
        subject$.next({ delta: 3 });
        subject$.complete();
    });

    it("Should only defined", () => expect(deltaList).toBeDefined());
    it("should mutate only", () => expect(deltaList.length).toBe(1));
    it("should change detla", () => expect(deltaList[0]).toBe(6));
})