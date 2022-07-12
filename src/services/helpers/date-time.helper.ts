import { Injectable } from "@angular/core";
import * as moment from 'moment';

@Injectable()
export class DateTimeHelper {
    getCurrentDate(timeZone: string, isTimeEmpty: boolean = true): Date {
        let currentDate = this.convertDateToUserTimeZone(new Date(), timeZone);
        if (isTimeEmpty) currentDate.setHours(0, 0, 0, 0);

        return currentDate;
    }

    getTomorrowDate(timeZone: string): Date {
        let tomorrowDate = new Date();

        let currentDate = this.getCurrentDate(timeZone);
        tomorrowDate.setDate(currentDate.getDate() + 1);

        tomorrowDate.setHours(0, 0, 0, 0);
        return tomorrowDate;
    }

    getNextMondayDate(timeZone: string): Date {
        let nextMondayDate = new Date();

        let currentDate = this.getCurrentDate(timeZone);
        nextMondayDate.setDate(currentDate.getDate() + (((1 + 7 - currentDate.getDay()) % 7) || 7));

        nextMondayDate.setHours(0, 0, 0, 0);
        return nextMondayDate;
    }

    convertDateToUserTimeZone(dateToConvert: Date, timeZone: string): Date {
        let result = new Date(dateToConvert.toLocaleString("en-US", { timeZone: timeZone }));
        return result;
    }

    convertDateToUtcString(dateToConvert: Date): string {
        let result = moment(new Date(dateToConvert)).utc().format();
        return result;
    }
}