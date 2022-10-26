//Import environment variable
import "dotenv/config";

//Import packages.
import {io, Socket} from "socket.io-client";
import {Server} from "socket.io";
import fs from "fs";
import https from 'https';

//Import self-made packages.
import {currentTimeReadable} from "@pierogi.dev/readable_time";

//Import types.
import {netStats, netStatsArray} from "./types/types";
import {
    ServerToEthChartSocketClientEvents,
    ethChartSocketClientToServerEvents,
    ethChartSocketServerToFrontendEvents,
    frontendToEthChartSocketServerEvents
} from "./types/socketEvents";

let minutelyNetStats: netStatsArray = [];
let hourlyNetStats: netStatsArray = [];
let dailyNetStats: netStatsArray = [];
let weeklyNetStats: netStatsArray = [];

//Launch a socket client to get the data from the data pool server.
const clientName: string = 'ethChartSocketServer';

const ethChartSocketClient: Socket<ServerToEthChartSocketClientEvents, ethChartSocketClientToServerEvents> = io(`${process.env.DATAPOOL_SERVER_LAN_ADDRESS}`, {
    forceNew: true,
    query: {
        name: clientName,
    }
});

//
//Registering ethChartSocketClient events.
//

ethChartSocketClient.on('connect', () => {
    console.log(`${currentTimeReadable()} | Connect : dataPoolServer`);
    ethChartSocketClient.emit('requestInitialMinutelyNetStats');
    console.log(`${currentTimeReadable()} | Emit : 'requestInitialMinutelyNetStats' | To : dataPoolServer`);
    ethChartSocketClient.emit('requestInitialHourlyNetStats');
    console.log(`${currentTimeReadable()} | Emit : 'requestInitialHourlyNetStats' | To : dataPoolServer`);
    ethChartSocketClient.emit('requestInitialDailyNetStats');
    console.log(`${currentTimeReadable()} | Emit : 'requestInitialDailyNetStats' | To : dataPoolServer`);
    ethChartSocketClient.emit('requestInitialWeeklyNetStats');
    console.log(`${currentTimeReadable()} | Emit : 'requestInitialWeeklyNetStats' | To : dataPoolServer`);
});


//Re-emit request initial net stats events when the dataPoolServer does not have the initial net stats respectively.
ethChartSocketClient.on('stillNoInitialMinutelyNetStats', () => {
    console.log(`${currentTimeReadable()} | No data : The dataPoolServer does not have the initial minutely net stats yet.`);
    setTimeout(() => {
        ethChartSocketClient.emit('requestInitialMinutelyNetStats');
        console.log(`${currentTimeReadable()} | Re-emit : 'requestInitialMinutelyNetStats' | To : dataPoolServer`);
    }, 2000);
});
ethChartSocketClient.on('stillNoInitialHourlyNetStats', () => {
    console.log(`${currentTimeReadable()} | No data : The dataPoolServer does not have the initial hourly net stats yet.`);
    setTimeout(() => {
        ethChartSocketClient.emit('requestInitialHourlyNetStats');
        console.log(`${currentTimeReadable()} | Re-emit : 'requestInitialHourlyNetStats' | To : dataPoolServer`);
    }, 2000);
});
ethChartSocketClient.on('stillNoInitialDailyNetStats', () => {
    console.log(`${currentTimeReadable()} | No data : The dataPoolServer does not have the initial daily net stats yet.`);
    setTimeout(() => {
        ethChartSocketClient.emit('requestInitialDailyNetStats');
        console.log(`${currentTimeReadable()} | Re-emit : 'requestInitialDailyNetStats' | To : dataPoolServer`);
    }, 2000);
});
ethChartSocketClient.on('stillNoInitialWeeklyNetStats', () => {
    console.log(`${currentTimeReadable()} | No data : The dataPoolServer does not have the initial weekly net stats yet.`);
    setTimeout(() => {
        ethChartSocketClient.emit('requestInitialWeeklyNetStats');
        console.log(`${currentTimeReadable()} | Re-emit : 'requestInitialWeeklyNetStats' | To : dataPoolServer`);
    }, 2000);
});

//Send each basic initial data.
ethChartSocketClient.on('initialMinutelyNetStats', (initialMinutelyNetStats: netStatsArray) => {
    console.log(`${currentTimeReadable()} | Receive : 'initialMinutelyNetStats' | From : dataPoolServer`);
    minutelyNetStats = initialMinutelyNetStats;
});

ethChartSocketClient.on('initialHourlyNetStats', (initialHourlyNetStats: netStatsArray) => {
    console.log(`${currentTimeReadable()} | Receive : 'initialHourlyNetStats' | From : dataPoolServer`);
    hourlyNetStats = initialHourlyNetStats;
});

ethChartSocketClient.on('initialDailyNetStats', (initialDailyNetStats: netStatsArray) => {
    console.log(`${currentTimeReadable()} | Receive : 'initialDailyNetStats' | From : dataPoolServer`);
    dailyNetStats = initialDailyNetStats;
});

ethChartSocketClient.on('initialWeeklyNetStats', (initialWeeklyNetStats: netStatsArray) => {
    console.log(`${currentTimeReadable()} | Receive : 'initialWeeklyNetStats' | From : dataPoolServer`);
    weeklyNetStats = initialWeeklyNetStats;
});

//Send each new data.
ethChartSocketClient.on('newMinutelyNetStats', (newMinutelyNetStats: netStats) => {
    if (minutelyNetStats.length !== 0) {
        minutelyNetStats = [...minutelyNetStats.slice(1), newMinutelyNetStats];
        console.log(`${currentTimeReadable()} | Receive : 'newMinutelyNetStats' | From : dataPoolServer`);
    }
    ethChartSocketServer.emit('newMinutelyNetStatsToFrontend', newMinutelyNetStats);
    console.log(`${currentTimeReadable()} | Emit : 'newMinutelyNetStatsToFrontend' | To : frontend`);
});

ethChartSocketClient.on('newHourlyNetStats', (newHourlyNetStats: netStats) => {
    if (hourlyNetStats.length !== 0) {
        hourlyNetStats = [...hourlyNetStats.slice(1), newHourlyNetStats];
        console.log(`${currentTimeReadable()} | Receive : 'newHourlyNetStats' | From : dataPoolServer`);
    }
    ethChartSocketServer.emit('newHourlyNetStatsToFrontend', newHourlyNetStats);
    console.log(`${currentTimeReadable()} | Emit : 'newHourlyNetStatsToFrontend' | To : frontend`);
});

ethChartSocketClient.on('newDailyNetStats', (newDailyNetStats: netStats) => {
    if (dailyNetStats.length !== 0) {
        dailyNetStats = [...dailyNetStats.slice(1), newDailyNetStats];
        console.log(`${currentTimeReadable()} | Receive : 'newDailyNetStats | From : dataPoolServer`);
    }
    ethChartSocketServer.emit('newDailyNetStatsToFrontend', newDailyNetStats);
    console.log(`${currentTimeReadable()} | Emit : 'newDailyNetStatsToFrontend' | To : frontend`);
});

ethChartSocketClient.on('newWeeklyNetStats', (newWeeklyNetStats: netStats) => {
    if (weeklyNetStats.length !== 0) {
        weeklyNetStats.splice(-1);
        weeklyNetStats = [newWeeklyNetStats, ...weeklyNetStats];
        console.log(`${currentTimeReadable()} | Receive : 'newWeeklyNetStats' | From : dataPoolServer`);
    }
    ethChartSocketServer.emit('newWeeklyNetStatsToFrontend', newWeeklyNetStats);
    console.log(`${currentTimeReadable()} | Emit : 'newWeeklyNetStats' | To : Frontend`);
});

//Launch ethChart socket server to serve the chart data to frontEnd.
const httpsServer = https.createServer({
    key: fs.readFileSync(`${process.env.SSL_CERTIFICATION_PRIVKEY}`),
    cert: fs.readFileSync(`${process.env.SSL_CERTIFICATION_CERT}`),
    ca: fs.readFileSync(`${process.env.SSL_CERTIFICATION_CHAIN}`),
})

const ethChartSocketServer: Server = new Server<frontendToEthChartSocketServerEvents, ethChartSocketServerToFrontendEvents>(httpsServer, {
    cors: {
        origin: '*',
    }
});

//
//Registering ethChartSocketServer events.
//

ethChartSocketServer.on('connect', (frontend) => {
    console.log(`${currentTimeReadable()} | Connect : frontend`);

    frontend.on('requestInitialMinutelyNetStats', () => {
        console.log(`${currentTimeReadable()} | Receive : 'requestInitialMinutelyNetStats' | From : frontend`);
        if (minutelyNetStats.length !== 0) {
            frontend.emit('initialMinutelyNetStatsToFrontend', minutelyNetStats, () => {
                console.log(`${currentTimeReadable()} | Emit : initialMinutelyNetStatsToFrontend | To : frontend`);
            });
        }
    });

    frontend.on('requestInitialHourlyNetStats', () => {
        console.log(`${currentTimeReadable()} | Receive : 'requestInitialHourlyNetStats' | From : frontend`);
        if (hourlyNetStats.length !== 0) {
            frontend.emit('initialHourlyNetStatsToFrontend', hourlyNetStats);
            console.log(`${currentTimeReadable()} | Emit : 'initialHourlyNetStatsToFrontend' | To : frontend`);
        }
    });

    frontend.on('requestInitialDailyNetStats', () => {
        console.log(`${currentTimeReadable()} | Receive : 'requestInitialDailyNetStats' | From : frontend`);
        if (dailyNetStats.length !== 0) {
            frontend.emit('initialDailyNetStatsToFrontend', dailyNetStats);
            console.log(`${currentTimeReadable()} | Emit : 'initialDailyNetStatsToFrontend' | To : frontend`);
        }
    });

    frontend.on('requestInitialWeeklyNetStats', () => {
        console.log(`${currentTimeReadable()} | Receive : 'requestInitialWeeklyNetStats' | From : frontend`);
        if (weeklyNetStats.length !== 0) {
            frontend.emit('initialWeeklyNetStatsToFrontend', weeklyNetStats);
            console.log(`${currentTimeReadable()} | Emit : 'initialWeeklyNetStatsToFrontend | To : frontend`);
        }
    });

    frontend.on('disconnect', () => {
        console.log(`${currentTimeReadable()} | Disconnect from a frontend`);
        frontend.disconnect();
    });
});

httpsServer.listen(8443);
