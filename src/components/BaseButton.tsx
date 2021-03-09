import styled from "styled-components";

export interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  bgColor?: string;
  // eslint requires "type" for raw <button>s, so let's do the same here
  type: NonNullable<React.ButtonHTMLAttributes<HTMLButtonElement>["type"]>;
}

export const BaseButton = styled.button<BaseButtonProps>`
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 1rem;
  line-height: 1rem;
  background: ${({ bgColor }) => bgColor ?? "#ddd"};
`;
