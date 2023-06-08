// Copyright (c) 2020 GitHub user u/garronej
import type { ReactNode } from "react";
import { forwardRef, memo } from "react";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";

import { makeStyles } from "../../lib/ThemeProvider";
import { useTheme } from "../../stories/theme";

export type CardProps = {
  className?: string;
  aboveDivider?: ReactNode;
  width?: number;
  children: ReactNode;
  transparentBg?: boolean;
};

export const Card = memo(
  forwardRef<any, CardProps>((props, ref) => {
    const {
      className,
      aboveDivider,
      width,
      children,
      transparentBg,
      //For the forwarding, rest should be empty (typewise)
      ...rest
    } = props;

    const theme = useTheme();
    //For the forwarding, rest should be empty (typewise),
    // eslint-disable-next-line @typescript-eslint/ban-types
    assert<Equals<typeof rest, {}>>();

    const isDarkModeEnabled = theme.isDarkModeEnabled;

    const { classes, cx } = useStyles();

    function blendHexColorWithOpacity(hexColor: string, opacity: number) {
      // Remove the '#' character from the hex color
      const normalizedHexColor = hexColor.replace("#", "");

      // Convert the opacity to its hexadecimal equivalent
      const opacityHex = Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0");

      // Combine the opacity hex value with the original hex color
      const blendedHexColor = `#${normalizedHexColor}${opacityHex}`;

      return blendedHexColor;
    }

    // const backgroundColorIfTransparent = blendHexColorWithOpacity(theme.colors.palette.focus[isDarkModeEnabled ? "light" : "main"], 0.08)
    const grayLight3 = theme.colors.palette[isDarkModeEnabled ? "dark" : "light"].greyVariant2;
    const backgroundColorIfTransparent = blendHexColorWithOpacity(grayLight3, 0.12);

    return (
      <div
        ref={ref}
        className={cx(classes.root, className)}
        {...rest}
        style={{ width: width, backgroundColor: transparentBg ? backgroundColorIfTransparent : undefined }}>
        {aboveDivider !== undefined && <div className={classes.aboveDivider}>{aboveDivider}</div>}
        <div className={classes.belowDivider}>{children}</div>
      </div>
    );
  })
);

const useStyles = makeStyles({ name: { Card } })((theme) => ({
  root: {
    borderRadius: 4,
    boxShadow: theme.shadows[1],
    backgroundColor: theme.colors.useCases.surfaces.surface1,
    "&:hover": {
      boxShadow: theme.shadows[6],
    },
    display: "flex",
    flexDirection: "column",
  },
  aboveDivider: {
    boxSizing: "border-box",
  },
  belowDivider: {
    padding: theme.spacing(4),
    paddingTop: theme.spacing(3),
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
}));
