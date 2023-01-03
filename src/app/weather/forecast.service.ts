import { NotificationsService } from './../notifications/notifications.service';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, pluck, mergeMap, filter, toArray, share, tap, catchError, retry } from 'rxjs/operators';
import { HttpParams, HttpClient } from '@angular/common/http';


interface OpenWeatherResponse {
  list: {
    dt_txt: string;
    main:{
      temp: number;
    }
  }[]
}

@Injectable({
  providedIn: 'root'
})
export class ForecastService {
  private url = 'https://api.openweathermap.org/data/2.5/forecast'

  constructor(private http: HttpClient, private notificationService: NotificationsService) { }
  
  getForecast(){
    return this.getCurrentLocation()
    .pipe(
      map(coords => {
        return new HttpParams()
          .set('lat', String(coords.latitude))
          .set('lon', String(coords.longitude))
          .set('units', 'metric')
          .set('appid', '9eba28108a68acb4e59b2df487aa2ff0')
      }),
      switchMap(params => this.http.get<OpenWeatherResponse>(this.url, { params })),
      pluck('list'),
      mergeMap(value => of(...value)),
      filter( (value, index) => index % 8 === 0),
      map(value => {
        return {
          dateString: value.dt_txt,
          temp: value.main.temp
        }
      }),
      toArray(),
      share(),
      tap(
        ()=> {
        this.notificationService.addSuccess('Weather loaded successfully')
      }, 
      catchError((err) => {
        // #1 - Handle the error
        this.notificationService.addError('Failed to load weather data');
        // #2 - Return a new observable
        return throwError(err);
      })
      ));  
  }

  getCurrentLocation(){
    return new Observable <GeolocationCoordinates> (observer => {
      window.navigator.geolocation.getCurrentPosition(
        position=> {
          observer.next(position.coords);
          observer.complete();
        },
        (err) => observer.error(err)
      );
    }).pipe(
      retry(1),
      tap(
        ()=> {
        this.notificationService.addSuccess('Got your location successfully')
      }, 
      catchError((err) => {
        // #1 - Handle the error
        this.notificationService.addError('Failed to get your location');
        // #2 - Return a new observable
        return throwError(err);
      })
      )
    );
  }
}
