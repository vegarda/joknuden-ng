import { Injectable } from '@angular/core';

import { ArchiveData, TimeUnit } from 'src/app/models/joknuden.models';

import { TungenesApi } from 'src/app/api/tungenes-api';
import { BehaviorSubject, Observable } from 'rxjs';
import { RoutingService } from 'src/app/services/routing.service';
import { RequestPromise } from 'src/app/utils/promise';
import { TimeService } from 'src/app/services/time.service';
import { filter } from 'rxjs/operators';




@Injectable()
export class ArchiveChartsService {

    private _archiveData$: BehaviorSubject<ArchiveData[]> = new BehaviorSubject([]);
    public get archiveData$(): Observable<ArchiveData[]> {
        return this._archiveData$;
    }
    public get archiveData(): ArchiveData[] {
        return this._archiveData$.value;
    }

    public get isFetching(): boolean {
        if (this.request) {
            return !this.request.isFulfilled;
        }
        return false;
    }

    constructor(
        private tungenesApi: TungenesApi,
        private routingService: RoutingService,
        private timeService: TimeService,
    ) {
        console.log(this);
        this.init();
    }

    private init(): void {

        console.log('this.routingService.isNavigating', this.routingService.isNavigating);

        this.timeService.timeParams$.pipe(filter(() => !this.routingService.isNavigating)).subscribe(timeParams => {
            this.updateData(timeParams.timeUnit, timeParams.amount);
        });

    }

    private request: RequestPromise<ArchiveData[]>;

    private async updateData(timeUnit: TimeUnit, amount: number = 1): Promise<void> {

        console.log('ArchiveChartsService.updateData()', timeUnit, amount);

        if (this.request) {
            this.request.abort();
        }

        try {
            const request = this.tungenesApi.getArchiveData(timeUnit, amount);
            this.request = request;
            const archiveData = await request;
            this.request = null;
            console.log(archiveData);
            this._archiveData$.next(archiveData);
        }
        catch (error) {
            console.error(error);
        }

    }

}
