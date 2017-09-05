import { PartialSoak, Soak, completeSoak } from './Soak';

describe("Soak", () => {
    describe("completeSoak", () => {
        it("undefined properties in partial should not be applied in complete soak", () => {

            type State = {
                a: string;
                b: string;
            }
            var partial: PartialSoak<State, any> = (state, action) => {
                return { a: 'partial-changed', b: undefined }
            }
            var complete = completeSoak(partial);
            var result = complete({a: 'original-a', b: 'original-b'}, {});
            expect(result.a).toEqual('partial-changed');
            expect(result.b).toEqual('original-b');
        })
    })
})