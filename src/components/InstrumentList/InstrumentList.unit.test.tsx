import { render, screen } from "@testing-library/react";
import React from "react";

import { InstrumentList } from "./InstrumentList";
import type { InstrumentListProps } from "./InstrumentList";

type ArrayElementType<T> = T extends (infer U)[] ? U : never;
type Instrument = ArrayElementType<InstrumentListProps["instruments"]>;

const INSTRUMENT1: Instrument = {
  id: 0,
  name: "Foo",
  summary: "Foo summary",
};

const INSTRUMENT2: Instrument = {
  id: 1,
  name: "Bar",
  summary: "Bar summary",
};

describe("<InstrumentList />", () => {
  describe("given 1 instrument object", () => {
    it("renders the instrument's data", () => {
      render(<InstrumentList instruments={[INSTRUMENT1]} />);
      expect(screen.getByText(INSTRUMENT1.summary)).toBeInTheDocument();
    });
  });

  describe("given 2 instrument objects", () => {
    it("renders both instruments' data", () => {
      render(<InstrumentList instruments={[INSTRUMENT1, INSTRUMENT2]} />);
      expect(screen.getByText(INSTRUMENT1.summary)).toBeInTheDocument();
      expect(screen.getByText(INSTRUMENT2.summary)).toBeInTheDocument();
    });
  });
});
