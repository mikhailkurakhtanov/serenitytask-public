import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Constants} from "../../components/constants";
import {Quote} from "../../models/entities/quote.model";

@Injectable()
export class QuoteService {
  private apiGetRandomQuoteUrl = 'quote/get-any';

  constructor(private http: HttpClient) { }

  getAny(): Observable<Quote> {
    return this.http.get<Quote>(Constants.apiUrl + this.apiGetRandomQuoteUrl);
  }
}
