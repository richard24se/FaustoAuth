import React, { useState } from "react";
import { Grid, Select, MenuItem, Input } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { BarChart, Bar } from "recharts";
import classnames from "classnames";

// styles
import { StyledTitle, StyledBottomStatsContainer, StyledStatCell, StyledTotalValueContainer, StyledTotalValue, StyledProfitArrow, StyledSelectInput } from "./styles";

// components
import Widget from "components/Widget";
import { Typography } from "components/Wrappers";

export default function BigStat(props) {
  var { product, total, color, registrations, bounce } = props;
  var theme = useTheme();

  // local
  var [value, setValue] = useState("daily");

  return (
    <Widget
      header={
        <StyledTitle>
          <Typography variant="h5">{product}</Typography>

          <Select
            value={value}
            onChange={e => setValue(e.target.value)}
            input={
              <StyledSelectInput
                disableUnderline
              />
            }
            // className={classes.select} // No direct replacement for classes.select, assuming it's handled by StyledSelectInput
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
        </StyledTitle>
      }
      upperTitle
    >
      <StyledTotalValueContainer>
        <StyledTotalValue>
          <Typography size="xxl" color="text" colorBrightness="secondary">
            {total[value]}
          </Typography>
          <Typography color={total.percent.profit ? "success" : "secondary"}>
            &nbsp;{total.percent.profit ? "+" : "-"}
            {total.percent.value}%
          </Typography>
        </StyledTotalValue>
        <BarChart width={150} height={70} data={getRandomData()}>
          <Bar
            dataKey="value"
            fill={theme.palette[color].main}
            radius={10}
            barSize={10}
          />
        </BarChart>
      </StyledTotalValueContainer>
      <StyledBottomStatsContainer>
        <StyledStatCell>
          <Grid container alignItems="center">
            <Typography variant="h6">{registrations[value].value}</Typography>
            <StyledProfitArrow isDanger={!registrations[value].profit}>
              <ArrowForwardIcon />
            </StyledProfitArrow>
          </Grid>
          <Typography size="sm" color="text" colorBrightness="secondary">
            Registrations
          </Typography>
        </StyledStatCell>
        <StyledStatCell>
          <Grid container alignItems="center">
            <Typography variant="h6">{bounce[value].value}%</Typography>
            <StyledProfitArrow isDanger={!registrations[value].profit}>
              <ArrowForwardIcon />
            </StyledProfitArrow>
          </Grid>
          <Typography size="sm" color="text" colorBrightness="secondary">
            Bounce Rate
          </Typography>
        </StyledStatCell>
        <StyledStatCell>
          <Grid container alignItems="center">
            <Typography variant="h6">
              {registrations[value].value * 10}
            </Typography>
            <StyledProfitArrow isDanger={!registrations[value].profit}>
              <ArrowForwardIcon />
            </StyledProfitArrow>
          </Grid>
          <Typography size="sm" color="text" colorBrightness="secondary">
            Views
          </Typography>
        </StyledStatCell>
      </StyledBottomStatsContainer>
    </Widget>
  );
}

// #######################################################################

function getRandomData() {
  return Array(7)
    .fill()
    .map(() => ({ value: Math.floor(Math.random() * 10) + 1 }));
}
