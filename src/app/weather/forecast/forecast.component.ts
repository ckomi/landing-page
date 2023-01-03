import { Component, OnInit } from '@angular/core';
import { ForecastService } from './../forecast.service';

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.css']
})
export class ForecastComponent implements OnInit {
  
  forecastData = [];

  constructor( forecastService: ForecastService ) {
    forecastService.getForecast().subscribe( (forecastData: any) => {
        this.forecastData = forecastData
        console.log(forecastData);
        
      });
  }

  ngOnInit() {}

}
