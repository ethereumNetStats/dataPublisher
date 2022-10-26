//Define the type of the server => client events.
import {netStats, netStatsArray} from "./types";

type ServerToEthChartSocketClientEvents = {
    stillNoInitialMinutelyNetStats: () => void,
    stillNoInitialHourlyNetStats: () => void,
    stillNoInitialDailyNetStats: () => void,
    stillNoInitialWeeklyNetStats: () => void,

    initialMinutelyNetStats: (initialMinutelyNetStats: netStatsArray) => void,
    initialHourlyNetStats: (initialHourlyNetStats: netStatsArray) => void,
    initialDailyNetStats: (initialDailyNetStats: netStatsArray) => void,
    initialWeeklyNetStats: (initialWeeklyNetStats: netStatsArray) => void,

    newMinutelyNetStats: (newMinutelyNetStats: netStats) => void,
    newHourlyNetStats: (newHourlyNetStats: netStats) => void,
    newDailyNetStats: (newDailyNetStats: netStats) => void,
    newWeeklyNetStats: (newWeeklyNetStats: netStats) => void,
}

//Define the type of the client => server events.
type ethChartSocketClientToServerEvents = {
    requestInitialMinutelyNetStats: () => void,
    requestInitialHourlyNetStats: () => void,
    requestInitialDailyNetStats: () => void,
    requestInitialWeeklyNetStats: () => void,
}

type ethChartSocketServerToFrontendEvents = {
    initialMinutelyNetStatsToFrontend: () => void,
    initialHourlyNetStatsToFrontend: () => void,
    initialDailyNetStatsToFrontend: () => void,
    initialWeeklyNetStatsToFrontend: () => void,

    newMinutelyNetStats: () => void,
    newHourlyNetStats: () => void,
    newDailyNetStats: () => void,
    newWeeklyNetStats: () => void,
}

type frontendToEthChartSocketServerEvents = {
    requestInitialMinutelyNetStats: () => void,
    requestInitialHourlyNetStats: () => void,
    requestInitialDailyNetStats: () => void,
    requestInitialWeeklyNetStats: () => void,
}

export type {
    ServerToEthChartSocketClientEvents,
    ethChartSocketClientToServerEvents,
    ethChartSocketServerToFrontendEvents,
    frontendToEthChartSocketServerEvents
}
