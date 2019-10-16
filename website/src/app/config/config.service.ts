import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  apiDomain: string;
  apiPort: number;

  constructor() {
    /* Change the following URL if you want to redirect api requests to
    another domain (e.g. localhost for testing purposes) */
    this.apiDomain = 'api.geranium.nexacenter.org';

    /* Change the following port number if you want to change the
    port used to connect to the API (suggested 80 for production) */
    this.apiPort = 80;
  }
}
