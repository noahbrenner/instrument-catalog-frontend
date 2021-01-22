import type { IInstrument } from "#src/types";

export function getInstrumentPath<T extends Pick<IInstrument, "id" | "name">>(
  instrument: T,
  isEditPage = false
): string {
  const encodedName = encodeURIComponent(instrument.name);
  return isEditPage
    ? `/instruments/${instrument.id}/${encodedName}/edit/`
    : `/instruments/${instrument.id}/${encodedName}/`;
}
