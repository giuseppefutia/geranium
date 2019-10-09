import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  baseURL: string;

  constructor() {
    /* Change the following URL if you want to redirect api requests to
    another domain (e.g. localhost for testing purposes) */
    this.baseURL = 'api.geranium.nexacenter.org';
  }
}
