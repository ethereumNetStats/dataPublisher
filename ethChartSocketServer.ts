import {io, Socket} from "socket.io-client";
import {Server} from "socket.io";
import fs from "fs";
import https from 'https';

const currentTimeReadable = (): string => {
    let date_obj = new Date();
    return `${date_obj.getUTCFullYear()}-${('0' + (date_obj.getUTCMonth() + 1)).slice(-2)}-${('0' + date_obj.getUTCDate()).slice(-2)} ${('0' + date_obj.getUTCHours()).slice(-2)}:${('0' + date_obj.getUTCMinutes()).slice(-2)}:${('0' + date_obj.getUTCSeconds()).slice(-2)}`;
};

type recordOfEthDB = {
    'id'?: number,
    'startTimeReadable'?: string,
    'endTimeReadable'?: string,
    'startTimeUnix': number,
    'endTimeUnix': number,
    'actualStartTimeUnix': number,
    'actualEndTimeUnix': number,
    'startBlockNumber': number,
    'endBlockNumber': number,
    'blocks': number,
    'totalBlockSize': number,
    'averageBlockSize': number,
    'totalDifficulty': number,
    'averageDifficulty': number,
    'totalUncleDifficulty': number,
    'hashRate': number,
    'transactions': number,
    'transactionsPerBlock': number,
    'noRecordFlag'?: boolean,
};

type recordOfEthDBArray = Array<recordOfEthDB>;

type addresses = {
    startTime: number,
    endTime: number,
    value: number,
}

type arrayOfAddresses = Array<addresses>

type addressesInTimeRange = {
    minutely: arrayOfAddresses,
    hourly: arrayOfAddresses,
    daily: arrayOfAddresses,
    weekly: arrayOfAddresses
}


//Define the type of the server => client events.
type ServerToEthChartSocketClientEvents = {
    stillNoMinutelyBasicInitialData: () => void,
    stillNoHourlyBasicInitialData: () => void,
    stillNoDailyBasicInitialData: () => void,
    stillNoWeeklyBasicInitialData: () => void,

    minutelyBasicInitialData: (minutelyBasicInitialData: recordOfEthDBArray) => void,
    hourlyBasicInitialData: (hourlyBasicInitialData: recordOfEthDBArray) => void,
    dailyBasicInitialData: (dailyBasicInitialData: recordOfEthDBArray) => void,
    weeklyBasicInitialData: (weeklyBasicInitialData: recordOfEthDBArray) => void,

    minutelyBasicNewData: (minutelyBasicNewData: recordOfEthDB) => void,
    hourlyBasicNewData: (hourlyBasicNewData: recordOfEthDB) => void,
    dailyBasicNewData: (dailyBasicNewData: recordOfEthDB) => void,
    weeklyBasicNewData: (weeklyBasicNewData: recordOfEthDB) => void,

    resultOfCountingAddress: (resultOfCountingAddress: addressesInTimeRange) => void,
}

//Define the type of the client => server events.
type ethChartSocketClientToServerEvents = {
    requestMinutelyBasicInitialData: () => void,
    requestHourlyBasicInitialData: () => void,
    requestDailyBasicInitialData: () => void,
    requestWeeklyBasicInitialData: () => void,

}

type ethChartSocketServerToFrontendEvents = {
    minutelyInitialBasicDataToFrontend: () => void,
    countingAddressData: () => void,
}

type frontendToEthChartSocketServerEvents = {
    requestMinutelyInitialBasicData: () => void,
}

let minutelyBasicChartData: recordOfEthDBArray = [];
let hourlyBasicChartData: recordOfEthDBArray = [];
let dailyBasicChartData: recordOfEthDBArray = [];
let weeklyBasicChartData: recordOfEthDBArray = [];
let countingAddressData: addressesInTimeRange = {minutely: [], hourly: [], daily: [], weekly: []};

//Launch a socket client to get the data from the data pool server.
const clientName: string = 'ethChartSocketServer';

const wsServerVpnAddress = 'ws://172.22.1.90:2226';
const wsServerLanAddress = 'ws://172.26.13.237:2226';
const ethChartSocketClient: Socket<ServerToEthChartSocketClientEvents, ethChartSocketClientToServerEvents> = io(wsServerLanAddress, {
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


//Re-emit each basic initial data when dataPoolServer does not have the basic initial data respectively.
ethChartSocketClient.on('stillNoMinutelyBasicInitialData', () => {
    console.log(`${currentTimeReadable()} | The dataPoolServer does not have the minutely basic initial data yet.`);
    console.log(`${currentTimeReadable()} | Re-emit the requestMinutelyBasicInitialData event after 1 second.`);
    setTimeout( () => {
        ethChartSocketClient.emit('requestMinutelyBasicInitialData');
        console.log(`${currentTimeReadable()} | Re-emit the requestMinutelyBasicInitialData event.`);
    }, 2000);
});
ethChartSocketClient.on('stillNoHourlyBasicInitialData', () => {
    console.log(`${currentTimeReadable()} | The dataPoolServer does not have the hourly basic initial data yet.`);
    console.log(`${currentTimeReadable()} | Re-emit the requestHourlyBasicInitialData event after 1 second.`);
    setTimeout( () => {
        ethChartSocketClient.emit('requestHourlyBasicInitialData');
        console.log(`${currentTimeReadable()} | Re-emit the requestHourlyBasicInitialData event.`);
    }, 2000);
});
ethChartSocketClient.on('stillNoDailyBasicInitialData', () => {
    console.log(`${currentTimeReadable()} | The dataPoolServer does not have the daily basic initial data yet.`);
    console.log(`${currentTimeReadable()} | Re-emit the requestDailyBasicInitialData event after 1 second.`);
    setTimeout( () => {
        ethChartSocketClient.emit('requestDailyBasicInitialData');
        console.log(`${currentTimeReadable()} | Re-emit the requestDailyBasicInitialData event.`);
    }, 2000);
});
ethChartSocketClient.on('stillNoWeeklyBasicInitialData', () => {
    console.log(`${currentTimeReadable()} | The dataPoolServer does not have the weekly basic initial data yet.`);
    console.log(`${currentTimeReadable()} | Re-emit the requestWeeklyBasicInitialData event after 1 second.`);
    setTimeout( () => {
        ethChartSocketClient.emit('requestWeeklyBasicInitialData');
        console.log(`${currentTimeReadable()} | Re-emit the requestWeeklyBasicInitialData event.`);
    }, 60 * 1000);
});

//Send each basic initial data.
ethChartSocketClient.on('minutelyBasicInitialData', (minutelyBasicInitialData: recordOfEthDBArray) => {
    console.log(`${currentTimeReadable()} | Receive the minutelyBasicInitialData from the dataPoolServer.`);
    minutelyBasicChartData = minutelyBasicInitialData;
});

ethChartSocketClient.on('hourlyBasicInitialData', (hourlyBasicInitialData: recordOfEthDBArray) => {
    console.log(`${currentTimeReadable()} | Receive the HourlyBasicInitialData from the dataPoolServer.`);
    hourlyBasicChartData = hourlyBasicInitialData;
});

ethChartSocketClient.on('dailyBasicInitialData', (dailyBasicInitialData: recordOfEthDBArray) => {
    console.log(`${currentTimeReadable()} | Receive the dailyBasicInitialData from the dataPoolServer.`);
    dailyBasicChartData = dailyBasicInitialData;
});

ethChartSocketClient.on('weeklyBasicInitialData', (weeklyBasicInitialData: recordOfEthDBArray) => {
    console.log(`${currentTimeReadable()} | Receive the weeklyBasicInitialData from the dataPoolServer.`);
    weeklyBasicChartData = weeklyBasicInitialData;
});

//Send each new data.
ethChartSocketClient.on('minutelyBasicNewData', (minutelyBasicNewData: recordOfEthDB) => {
    if (minutelyBasicChartData.length !== 0) {
        minutelyBasicChartData = [...minutelyBasicChartData.slice(1), minutelyBasicNewData];
        console.log(`${currentTimeReadable()} | Receive the minutelyBasicNewData event from the dataPoolServer.`);
    }
    ethChartSocketServer.emit('minutelyBasicNewDataToFrontend', minutelyBasicNewData);
    console.log(`${currentTimeReadable()} | Emit the minutelyBasicNewDataToFrontend event.`);
});

ethChartSocketClient.on('hourlyBasicNewData', (hourlyBasicNewData: recordOfEthDB) => {
    if (hourlyBasicChartData.length !== 0) {
        hourlyBasicChartData = [...hourlyBasicChartData.slice(1), hourlyBasicNewData];
        console.log(`${currentTimeReadable()} | Receive the hourlyBasicNewData event from the dataPoolServer.`);
    }
    ethChartSocketServer.emit('hourlyBasicNewDataToFrontend', hourlyBasicNewData);
    console.log(`${currentTimeReadable()} | Emit the hourlyBasicNewDataToFrontend event.`);
});

ethChartSocketClient.on('dailyBasicNewData', (dailyBasicNewData: recordOfEthDB) => {
    if (dailyBasicChartData.length !== 0) {
        dailyBasicChartData = [...dailyBasicChartData.slice(1), dailyBasicNewData];
        console.log(`${currentTimeReadable()} | Receive the dailyBasicNewData event from the dataPoolServer.`);
    }
    ethChartSocketServer.emit('dailyBasicNewDataToFrontend', dailyBasicNewData);
    console.log(`${currentTimeReadable()} | Emit the dailyBasicNewDataToFrontend event.`);
});

ethChartSocketClient.on('weeklyBasicNewData', (weeklyBasicNewData: recordOfEthDB) => {
    if (weeklyBasicChartData.length !== 0) {
        weeklyBasicChartData = [...weeklyBasicChartData.slice(1), weeklyBasicNewData];
        console.log(`${currentTimeReadable()} | Receive the weeklyBasicNewData event from the dataPoolServer.`);
    }
    ethChartSocketServer.emit('weeklyBasicNewDataToFrontend', weeklyBasicNewData);
    console.log(`${currentTimeReadable()} | Emit the weeklyBasicNewDataToFrontend event.`);
});

//Renew & send number of addresses data
ethChartSocketClient.on("resultOfCountingAddress", (resultOfCountingAddress: addressesInTimeRange) => {
    if (resultOfCountingAddress !== null) {
        countingAddressData = resultOfCountingAddress;
        console.log(`${currentTimeReadable()} | Receive the resultOfCountingAddress event from the dataPoolServer.`);
    }
    ethChartSocketServer.emit('countingAddressData', (countingAddressData));
    console.log(`${currentTimeReadable()} | Emit the countingAddressData event.`);
});

//Launch ethChart socket server to serve the chart data to frontEnd.
const httpsServer = https.createServer({
    key: fs.readFileSync(process.env.ssl_certification_privkey as string),
    cert: fs.readFileSync(process.env.ssl_certification_cert as string),
    ca: fs.readFileSync(process.env.ssl_certification_chain as string),
})

const ethChartSocketServer: Server = new Server<frontendToEthChartSocketServerEvents, ethChartSocketServerToFrontendEvents>(httpsServer, {
    cors: {
        origin: '*',
    }
});

ethChartSocketServer.on('connect', (frontend) => {
    console.log(`${currentTimeReadable()} | Connect with a frontend.`);

    frontend.on('requestMinutelyInitialBasicData', () => {
        console.log(`${currentTimeReadable()} | Receive the requestMinutelyInitialBasicData event from the frontend.`);
        if(minutelyBasicChartData.length !== 0) {
            frontend.emit('minutelyInitialBasicDataToFrontend', minutelyBasicChartData);
            console.log(`${currentTimeReadable()} | Emit the minutelyInitialBasicDataToFrontend event to the frontend.`);
        }
    });

    frontend.on('requestHourlyInitialBasicData', () => {
        console.log(`${currentTimeReadable()} | Receive the requestHourlyInitialBasicData event from the frontend.`);
        if(hourlyBasicChartData.length !== 0) {
            frontend.emit('hourlyInitialBasicDataToFrontend', hourlyBasicChartData);
            console.log(`${currentTimeReadable()} | Emit the hourlyInitialBasicDataToFrontend event to the frontend.`);
        }
    });

    frontend.on('requestDailyInitialBasicData', () => {
        console.log(`${currentTimeReadable()} | Receive the requestDailyInitialBasicData event from the frontend.`);
        if(dailyBasicChartData.length !== 0) {
            frontend.emit('dailyInitialBasicDataToFrontend', dailyBasicChartData);
            console.log(`${currentTimeReadable()} | Emit the dailyInitialBasicDataToFrontend event to the frontend.`);
        }
    });

    frontend.on('requestWeeklyInitialBasicData', () => {
        console.log(`${currentTimeReadable()} | Receive the requestWeeklyInitialBasicData event from the frontend.`);
        if(weeklyBasicChartData.length !== 0) {
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
