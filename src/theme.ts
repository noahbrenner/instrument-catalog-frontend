export const defaultTheme = {
  headerBg: "#779",
  headerHeight: "50px",
  mobileBreakpoint: "600px",
};

type Theme = typeof defaultTheme;

declare module "styled-components" {
  // Extending the DefaultTheme allows styled components to access theme types
  // https://styled-components.com/docs/api#create-a-declarations-file

  // TypeScript doesn't accept `(typeof theme)` here, so we're extending a type
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
