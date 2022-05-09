import { io } from "socket.io-client";
import { Server } from "socket.io";
import fs from "fs";
import https from 'https';
const currentTimeReadable = () => {
    let date_obj = new Date();
    return `${date_obj.getUTCFullYear()}-${('0' + (date_obj.getUTCMonth() + 1)).slice(-2)}-${('0' + date_obj.getUTCDate()).slice(-2)} ${('0' + date_obj.getUTCHours()).slice(-2)}:${('0' + date_obj.getUTCMinutes()).slice(-2)}:${('0' + date_obj.getUTCSeconds()).slice(-2)}`;
};
let minutelyBasicChartData = [];
let hourlyBasicChartData = [];
let dailyBasicChartData = [];
let weeklyBasicChartData = [];
const clientName = 'ethChartSocketServer';
const ethChartSocketClient = io('ws://172.26.13.237:2226', {
    forceNew: true,
    query: {
        name: clientName,
    }
});
ethChartSocketClient.on('connect', () => {
    console.log(`${currentTimeReadable()} | Connect with the dataPoolServer.`);
    ethChartSocketClient.emit('requestMinutelyBasicInitialData');
    console.log(`${currentTimeReadable()} | Emit the requestMinutelyBasicInitialData.`);
    ethChartSocketClient.emit('requestHourlyBasicInitialData');
    console.log(`${currentTimeReadable()} | Emit the requestHourlyBasicInitialData.`);
    ethChartSocketClient.emit('requestDailyBasicInitialData');
    console.log(`${currentTimeReadable()} | Emit the requestDailyBasicInitialData.`);
    ethChartSocketClient.emit('requestWeeklyBasicInitialData');
    console.log(`${currentTimeReadable()} | Emit the requestWeeklyBasicInitialData.`);
});
ethChartSocketClient.on('stillNoMinutelyBasicInitialData', () => {
    console.log(`${currentTimeReadable()} | The dataPoolServer does not have the minutely basic initial data yet.`);
    console.log(`${currentTimeReadable()} | Re-emit the requestMinutelyBasicInitialData event after 1 second.`);
    setTimeout(() => {
        ethChartSocketClient.emit('requestMinutelyBasicInitialData');
        console.log(`${currentTimeReadable()} | Re-emit the requestMinutelyBasicInitialData event.`);
    }, 2000);
});
ethChartSocketClient.on('stillNoHourlyBasicInitialData', () => {
    console.log(`${currentTimeReadable()} | The dataPoolServer does not have the hourly basic initial data yet.`);
    console.log(`${currentTimeReadable()} | Re-emit the requestHourlyBasicInitialData event after 1 second.`);
    setTimeout(() => {
        ethChartSocketClient.emit('requestHourlyBasicInitialData');
        console.log(`${currentTimeReadable()} | Re-emit the requestHourlyBasicInitialData event.`);
    }, 2000);
});
ethChartSocketClient.on('stillNoDailyBasicInitialData', () => {
    console.log(`${currentTimeReadable()} | The dataPoolServer does not have the daily basic initial data yet.`);
    console.log(`${currentTimeReadable()} | Re-emit the requestDailyBasicInitialData event after 1 second.`);
    setTimeout(() => {
        ethChartSocketClient.emit('requestDailyBasicInitialData');
        console.log(`${currentTimeReadable()} | Re-emit the requestDailyBasicInitialData event.`);
    }, 2000);
});
ethChartSocketClient.on('stillNoWeeklyBasicInitialData', () => {
    console.log(`${currentTimeReadable()} | The dataPoolServer does not have the weekly basic initial data yet.`);
    console.log(`${currentTimeReadable()} | Re-emit the requestWeeklyBasicInitialData event after 1 second.`);
    setTimeout(() => {
        ethChartSocketClient.emit('requestWeeklyBasicInitialData');
        console.log(`${currentTimeReadable()} | Re-emit the requestWeeklyBasicInitialData event.`);
    }, 60 * 1000);
});
ethChartSocketClient.on('minutelyBasicInitialData', (minutelyBasicInitialData) => {
    console.log(`${currentTimeReadable()} | Receive the minutelyBasicInitialData from the dataPoolServer.`);
    minutelyBasicChartData = minutelyBasicInitialData;
});
ethChartSocketClient.on('hourlyBasicInitialData', (hourlyBasicInitialData) => {
    console.log(`${currentTimeReadable()} | Receive the HourlyBasicInitialData from the dataPoolServer.`);
    hourlyBasicChartData = hourlyBasicInitialData;
});
ethChartSocketClient.on('dailyBasicInitialData', (dailyBasicInitialData) => {
    console.log(`${currentTimeReadable()} | Receive the dailyBasicInitialData from the dataPoolServer.`);
    dailyBasicChartData = dailyBasicInitialData;
});
ethChartSocketClient.on('weeklyBasicInitialData', (weeklyBasicInitialData) => {
    console.log(`${currentTimeReadable()} | Receive the weeklyBasicInitialData from the dataPoolServer.`);
    weeklyBasicChartData = weeklyBasicInitialData;
});
ethChartSocketClient.on('minutelyBasicNewData', (minutelyBasicNewData) => {
    if (minutelyBasicChartData.length !== 0) {
        minutelyBasicChartData = [...minutelyBasicChartData.slice(1), minutelyBasicNewData];
        console.log(`${currentTimeReadable()} | Receive the minutelyBasicNewData event from the dataPoolServer.`);
    }
    ethChartSocketServer.emit('minutelyBasicNewDataToFrontend', minutelyBasicNewData);
    console.log(`${currentTimeReadable()} | Emit the minutelyBasicNewDataToFrontend event.`);
});
ethChartSocketClient.on('hourlyBasicNewData', (hourlyBasicNewData) => {
    if (hourlyBasicChartData.length !== 0) {
        hourlyBasicChartData = [...hourlyBasicChartData.slice(1), hourlyBasicNewData];
        console.log(`${currentTimeReadable()} | Receive the hourlyBasicNewData event from the dataPoolServer.`);
    }
    ethChartSocketServer.emit('hourlyBasicNewDataToFrontend', hourlyBasicNewData);
    console.log(`${currentTimeReadable()} | Emit the hourlyBasicNewDataToFrontend event.`);
});
ethChartSocketClient.on('dailyBasicNewData', (dailyBasicNewData) => {
    if (dailyBasicChartData.length !== 0) {
        dailyBasicChartData = [...dailyBasicChartData.slice(1), dailyBasicNewData];
        console.log(`${currentTimeReadable()} | Receive the dailyBasicNewData event from the dataPoolServer.`);
    }
    ethChartSocketServer.emit('dailyBasicNewDataToFrontend', dailyBasicNewData);
    console.log(`${currentTimeReadable()} | Emit the dailyBasicNewDataToFrontend event.`);
});
ethChartSocketClient.on('weeklyBasicNewData', (weeklyBasicNewData) => {
    if (weeklyBasicChartData.length !== 0) {
        weeklyBasicChartData = [...weeklyBasicChartData.slice(1), weeklyBasicNewData];
        console.log(`${currentTimeReadable()} | Receive the weeklyBasicNewData event from the dataPoolServer.`);
    }
    ethChartSocketServer.emit('weeklyBasicNewDataToFrontend', weeklyBasicNewData);
    console.log(`${currentTimeReadable()} | Emit the weeklyBasicNewDataToFrontend event.`);
});
const httpsServer = https.createServer({
    key: fs.readFileSync(process.env.ssl_certification_privkey),
    cert: fs.readFileSync(process.env.ssl_certification_cert),
    ca: fs.readFileSync(process.env.ssl_certification_chain),
});
const ethChartSocketServer = new Server(httpsServer, {
    cors: {
        origin: '*',
    }
});
ethChartSocketServer.on('connect', (frontend) => {
    console.log(`${currentTimeReadable()} | Connect with a frontend.`);
    frontend.on('requestMinutelyInitialBasicData', () => {
        console.log(`${currentTimeReadable()} | Receive the requestMinutelyInitialBasicData event from the frontend.`);
        if (minutelyBasicChartData.length !== 0) {
            frontend.emit('minutelyInitialBasicDataToFrontend', minutelyBasicChartData);
            console.log(`${currentTimeReadable()} | Emit the minutelyInitialBasicDataToFrontend event to the frontend.`);
        }
    });
    frontend.on('requestHourlyInitialBasicData', () => {
        console.log(`${currentTimeReadable()} | Receive the requestHourlyInitialBasicData event from the frontend.`);
        if (hourlyBasicChartData.length !== 0) {
            frontend.emit('hourlyInitialBasicDataToFrontend', hourlyBasicChartData);
            console.log(`${currentTimeReadable()} | Emit the hourlyInitialBasicDataToFrontend event to the frontend.`);
        }
    });
    frontend.on('requestDailyInitialBasicData', () => {
        console.log(`${currentTimeReadable()} | Receive the requestDailyInitialBasicData event from the frontend.`);
        if (dailyBasicChartData.length !== 0) {
            frontend.emit('dailyInitialBasicDataToFrontend', dailyBasicChartData);
            console.log(`${currentTimeReadable()} | Emit the dailyInitialBasicDataToFrontend event to the frontend.`);
        }
    });
    frontend.on('requestWeeklyInitialBasicData', () => {
        console.log(`${currentTimeReadable()} | Receive the requestWeeklyInitialBasicData event from the frontend.`);
        if (weeklyBasicChartData.length !== 0) {
            frontend.emit('weeklyInitialBasicDataToFrontend', weeklyBasicChartData);
            console.log(`${currentTimeReadable()} | Emit the weeklyInitialBasicDataToFrontend event to the frontend.`);
        }
    });
    frontend.on('disconnect', () => {
        console.log(`${currentTimeReadable()} | Disconnect from a frontend`);
        frontend.disconnect();
    });
});
httpsServer.listen(8443);
