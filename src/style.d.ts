import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    bgColor: string;
    textColor: {
      default: string;
      active: string;
      light: string;
      blue: string;
    };
    accentColor: string;
  }
}
