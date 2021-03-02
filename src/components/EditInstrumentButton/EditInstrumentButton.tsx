import { useNavigate } from "@reach/router";
import React from "react";

import { BaseButton } from "#components/BaseButton";
import type { IInstrument } from "#src/types";
import { getInstrumentPath } from "#utils/paths";

export type EditInstrumentButtonProps = Pick<IInstrument, "id" | "name">;

export function EditInstrumentButton(
  idAndName: EditInstrumentButtonProps
): JSX.Element {
  const navigate = useNavigate();
  const url = getInstrumentPath(idAndName, /* isEditPage */ true);
  return <BaseButton onClick={() => navigate(url)}>Edit instrument</BaseButton>;
}
