import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    bgColor: {
      default: string;
      active: string;
    };
    textColor: {
      default: string;
      active: string;
      light: string;
      blue: string;
    };
    accentColor: string;
  }
}
