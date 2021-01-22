import { getInstrumentPath } from "./paths";

describe("getInstrumentPath()", () => {
  describe("given an instrument object and no second argument", () => {
    it("returns the path for the instrument's display page", () => {
      expect(getInstrumentPath({ name: "Foo", id: 11 })).toEqual(
        "/instruments/11/Foo/"
      );
      expect(getInstrumentPath({ name: "Foo Bar", id: 7 })).toEqual(
        "/instruments/7/Foo%20Bar/"
      );
    });
  });

  describe("given an instrument object and `false`", () => {
    it("returns the path for the instrument's display page", () => {
      expect(getInstrumentPath({ name: "Foo", id: 11 }, false)).toEqual(
        "/instruments/11/Foo/"
      );
      expect(getInstrumentPath({ name: "Foo Bar", id: 7 }, false)).toEqual(
        "/instruments/7/Foo%20Bar/"
      );
    });
  });

  describe("given an instrument object and `true`", () => {
    it("returns the path for the instrument's edit page", () => {
      expect(getInstrumentPath({ name: "Foo", id: 11 }, true)).toEqual(
        "/instruments/11/Foo/edit/"
      );
      expect(getInstrumentPath({ name: "Foo Bar", id: 7 }, true)).toEqual(
        "/instruments/7/Foo%20Bar/edit/"
      );
    });
  });
});
