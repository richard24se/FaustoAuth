import React, { useState } from "react";
import {
  Grid,
  LinearProgress,
  Select,
  OutlinedInput,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  LineChart,
  Line,
  Area,
  PieChart,
  Pie,
  Cell,
  YAxis,
  XAxis,
} from "recharts";

// styles
import { StyledCard, StyledVisitsNumberContainer, StyledProgressSection, StyledProgressTitle, StyledProgress, StyledPieChartLegendWrapper, StyledLegendItemContainer, StyledFullHeightBody, StyledFullHeightBodyStyles, StyledTableWidget, StyledTableWidgetStyles, StyledProgressBar, StyledPerformanceLegendWrapper, StyledLegendElement, StyledLegendElementText, StyledServerOverviewElement, StyledServerOverviewElementText, StyledServerOverviewElementChartWrapper, StyledMainChartBody, StyledMainChartBodyStyles, StyledMainChartHeader, StyledMainChartHeaderLabels, StyledMainChartHeaderLabel, StyledMainChartSelectRoot, StyledMainChartLegendElement } from "./styles";

// components
import mock from "./mock";
import Widget from "../../components/Widget";
import PageTitle from "../../components/PageTitle";
import { Typography } from "../../components/Wrappers";
import Dot from "../../components/Sidebar/components/Dot";
import Table from "./components/Table/Table";
import BigStat from "./components/BigStat/BigStat";

const mainChartData = getMainChartData();
const PieChartData = [
  { name: "Group A", value: 400, color: "primary" },
  { name: "Group B", value: 300, color: "secondary" },
  { name: "Group C", value: 300, color: "warning" },
  { name: "Group D", value: 200, color: "success" },
];

export default function Dashboard(props) {
  var theme = useTheme();

  // local
  var [mainChartState, setMainChartState] = useState("monthly");

  return (
    <>
      <PageTitle title="Dashboard" button="Latest Reports" />
      <Grid container spacing={4}>
        <Grid item lg={3} md={4} sm={6} xs={12}>
          <Widget
            title="Visits Today"
            upperTitle
            bodySx={StyledFullHeightBodyStyles({ theme })}
            as={StyledCard}
          >
            <StyledVisitsNumberContainer>
              <Typography size="xl" weight="medium">
                12, 678
              </Typography>
              <LineChart
                width={55}
                height={30}
                data={[
                  { value: 10 },
                  { value: 15 },
                  { value: 10 },
                  { value: 17 },
                  { value: 18 },
                ]}
                margin={{ left: theme.spacing(2) }}
              >
                <Line
                  type="natural"
                  dataKey="value"
                  stroke={theme.palette.success.main}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </StyledVisitsNumberContainer>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                <Typography color="text" colorBrightness="secondary">
                  Registrations
                </Typography>
                <Typography size="md">860</Typography>
              </Grid>
              <Grid item>
                <Typography color="text" colorBrightness="secondary">
                  Sign Out
                </Typography>
                <Typography size="md">32</Typography>
              </Grid>
              <Grid item>
                <Typography color="text" colorBrightness="secondary">
                  Rate
                </Typography>
                <Typography size="md">3.25%</Typography>
              </Grid>
            </Grid>
          </Widget>
        </Grid>
        <Grid item lg={3} md={8} sm={6} xs={12}>
          <Widget
            title="App Performance"
            upperTitle
            as={StyledCard}
            bodySx={StyledFullHeightBodyStyles({ theme })}
          >
            <StyledPerformanceLegendWrapper>
              <StyledLegendElement>
                <Dot color="warning" />
                <StyledLegendElementText
                  color="text"
                  colorBrightness="secondary"
                >
                  Integration
                </StyledLegendElementText>
              </StyledLegendElement>
              <StyledLegendElement>
                <Dot color="primary" />
                <StyledLegendElementText
                  color="text"
                  colorBrightness="secondary"
                >
                  SDK
                </StyledLegendElementText>
              </StyledLegendElement>
            </StyledPerformanceLegendWrapper>
            <StyledProgressSection>
              <StyledProgressTitle
                size="md"
                color="text"
                colorBrightness="secondary"
              >
                Integration
              </StyledProgressTitle>
              <StyledProgress
                variant="determinate"
                value={30}
                barColor={theme.palette.warning.main}
              />
            </StyledProgressSection>
            <StyledProgressSection>
              <StyledProgressTitle
                size="md"
                color="text"
                colorBrightness="secondary"
              >
                SDK
              </StyledProgressTitle>
              <StyledProgress
                variant="determinate"
                value={55}
                barColor={theme.palette.warning.main}
              />
            </StyledProgressSection>
          </Widget>
        </Grid>
        <Grid item lg={3} md={8} sm={6} xs={12}>
          <Widget
            title="Server Overview"
            upperTitle
            as={StyledCard}
            bodySx={StyledFullHeightBodyStyles({ theme })}
          >
            <StyledServerOverviewElement>
              <StyledServerOverviewElementText
                color="text"
                colorBrightness="secondary"
              >
                60% / 37°С / 3.3 Ghz
              </StyledServerOverviewElementText>
              <StyledServerOverviewElementChartWrapper>
                <ResponsiveContainer height={50} width="99%">
                  <AreaChart data={getRandomData(10)}>
                    <Area
                      type="natural"
                      dataKey="value"
                      stroke={theme.palette.secondary.main}
                      fill={theme.palette.secondary.light}
                      strokeWidth={2}
                      fillOpacity="0.25"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </StyledServerOverviewElementChartWrapper>
            </StyledServerOverviewElement>
            <StyledServerOverviewElement>
              <StyledServerOverviewElementText
                color="text"
                colorBrightness="secondary"
              >
                54% / 31°С / 3.3 Ghz
              </StyledServerOverviewElementText>
              <StyledServerOverviewElementChartWrapper>
                <ResponsiveContainer height={50} width="99%">
                  <AreaChart data={getRandomData(10)}>
                    <Area
                      type="natural"
                      dataKey="value"
                      stroke={theme.palette.primary.main}
                      fill={theme.palette.primary.light}
                      strokeWidth={2}
                      fillOpacity="0.25"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </StyledServerOverviewElementChartWrapper>
            </StyledServerOverviewElement>
            <StyledServerOverviewElement>
              <StyledServerOverviewElementText
                color="text"
                colorBrightness="secondary"
              >
                57% / 21°С / 3.3 Ghz
              </StyledServerOverviewElementText>
              <StyledServerOverviewElementChartWrapper>
                <ResponsiveContainer height={50} width="99%">
                  <AreaChart data={getRandomData(10)}>
                    <Area
                      type="natural"
                      dataKey="value"
                      stroke={theme.palette.warning.main}
                      fill={theme.palette.warning.light}
                      strokeWidth={2}
                      fillOpacity="0.25"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </StyledServerOverviewElementChartWrapper>
            </StyledServerOverviewElement>
          </Widget>
        </Grid>
        <Grid item lg={3} md={4} sm={6} xs={12}>
          <Widget title="Revenue Breakdown" upperTitle as={StyledCard}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <ResponsiveContainer width="100%" height={144}>
                  <PieChart margin={{ left: theme.spacing(2) }}>
                    <Pie
                      data={PieChartData}
                      innerRadius={45}
                      outerRadius={60}
                      dataKey="value"
                    >
                      {PieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={theme.palette[entry.color].main}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={6}>
                <StyledPieChartLegendWrapper>
                  {PieChartData.map(({ name, value, color }, index) => (
                    <StyledLegendItemContainer key={color}>
                      <Dot color={color} />
                      <Typography style={{ whiteSpace: "nowrap" }}>
                        &nbsp;{name}&nbsp;
                      </Typography>
                      <Typography color="text" colorBrightness="secondary">
                        &nbsp;{value}
                      </Typography>
                    </StyledLegendItemContainer>
                  ))}
                </StyledPieChartLegendWrapper>
              </Grid>
            </Grid>
          </Widget>
        </Grid>
        <Grid item xs={12}>
          <Widget
            bodySx={StyledMainChartBodyStyles({ theme })}
            header={
              <StyledMainChartHeader>
                <Typography
                  variant="h5"
                  color="text"
                  colorBrightness="secondary"
                >
                  Daily Line Chart
                </Typography>
                <StyledMainChartHeaderLabels>
                  <StyledMainChartHeaderLabel>
                    <Dot color="warning" />
                    <StyledMainChartLegendElement>
                      Tablet
                    </StyledMainChartLegendElement>
                  </StyledMainChartHeaderLabel>
                  <StyledMainChartHeaderLabel>
                    <Dot color="primary" />
                    <StyledMainChartLegendElement>
                      Mobile
                    </StyledMainChartLegendElement>
                  </StyledMainChartHeaderLabel>
                  <StyledMainChartHeaderLabel>
                    <Dot color="primary" />
                    <StyledMainChartLegendElement>
                      Desktop
                    </StyledMainChartLegendElement>
                  </StyledMainChartHeaderLabel>
                </StyledMainChartHeaderLabels>
                <Select
                  value={mainChartState}
                  onChange={e => setMainChartState(e.target.value)}
                  input={
                    <StyledMainChartSelectRoot
                      labelWidth={0}
                    />
                  }
                  autoWidth
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </StyledMainChartHeader>
            }
          >
            <ResponsiveContainer width="100%" minWidth={500} height={350}>
              <ComposedChart
                margin={{ top: 0, right: -15, left: -15, bottom: 0 }}
                data={mainChartData}
              >
                <YAxis
                  ticks={[0, 2500, 5000, 7500]}
                  tick={{ fill: theme.palette.text.hint + "80", fontSize: 14 }}
                  stroke={theme.palette.text.hint + "80"}
                  tickLine={false}
                />
                <XAxis
                  tickFormatter={i => i + 1}
                  tick={{ fill: theme.palette.text.hint + "80", fontSize: 14 }}
                  stroke={theme.palette.text.hint + "80"}
                  tickLine={false}
                />
                <Area
                  type="natural"
                  dataKey="desktop"
                  fill={theme.palette.background.light}
                  strokeWidth={0}
                  activeDot={false}
                />
                <Line
                  type="natural"
                  dataKey="mobile"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
                <Line
                  type="linear"
                  dataKey="tablet"
                  stroke={theme.palette.warning.main}
                  strokeWidth={2}
                  dot={{
                    stroke: theme.palette.warning.dark,
                    strokeWidth: 2,
                    fill: theme.palette.warning.main,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Widget>
        </Grid>
        {mock.bigStat.map(stat => (
          <Grid item md={4} sm={6} xs={12} key={stat.product}>
            <BigStat {...stat} />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Widget
            title="Support Requests"
            upperTitle
            noBodyPadding
            bodySx={StyledTableWidgetStyles({ theme })}
          >
            <Table data={mock.table} />
          </Widget>
        </Grid>
      </Grid>
    </>
  );
}

// #######################################################################
function getRandomData(length, min, max, multiplier = 10, maxDiff = 10) {
  var array = new Array(length).fill();
  let lastValue;

  return array.map((item, index) => {
    let randomValue = Math.floor(Math.random() * multiplier + 1);

    while (
      randomValue <= min ||
      randomValue >= max ||
      (lastValue && randomValue - lastValue > maxDiff)
    ) {
      randomValue = Math.floor(Math.random() * multiplier + 1);
    }

    lastValue = randomValue;

    return { value: randomValue };
  });
}

function getMainChartData() {
  var resultArray = [];
  var tablet = getRandomData(31, 3500, 6500, 7500, 1000);
  var desktop = getRandomData(31, 1500, 7500, 7500, 1500);
  var mobile = getRandomData(31, 1500, 7500, 7500, 1500);

  for (let i = 0; i < tablet.length; i++) {
    resultArray.push({
      tablet: tablet[i].value,
      desktop: desktop[i].value,
      mobile: mobile[i].value,
    });
  }

  return resultArray;
}
