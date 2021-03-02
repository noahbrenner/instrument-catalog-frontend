import styled from "styled-components";

export const BaseButton = styled.button<{ bgColor?: string }>`
  border: 2px solid #bbb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 1rem;
  line-height: 1rem;
  background: ${({ bgColor }) => bgColor ?? "#ddd"};
`;
