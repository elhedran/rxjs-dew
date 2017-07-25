import 'jasmine';
import { Soak } from '..';

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

describe("soak modifies state", () => {
    const next = counterSoak(initialCounterState, { delta: 2});
    it('has changed', () => {
        expect(next.counter).toBe(2);
    })
});