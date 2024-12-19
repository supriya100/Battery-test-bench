import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GraphDataService {
private apiUrl = 'https://fkuxdeho3xdoc6i7bhxih6i7ki0xoiwv.lambda-url.eu-west-1.on.aws/';

  constructor(private http: HttpClient) { }

  getData(): Observable<any>{
    return this.http.get<any>(this.apiUrl);
  }
}
