import { Injectable } from '@angular/core';
import { Author } from '../models/author.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface ResponseAuthors {
  id: string;
  name: string;
  uri: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthorsService {

  constructor(private http: HttpClient) {}

  /**
   * Send HTTP GET request for all the authors that have publications inherent the topic passed as argument
   *
   * @param query the topic to be used as query
   * @param block
   */
  getAuthorsBlock(query: string, block: number): Observable<Author[]> {

    const linesPerQuery = 10;
    const linesOffset = linesPerQuery * block;
    const url = 'http://api.geranium.nexacenter.org/api?'
              + encodeURI(`type=authors&topic=${query}&lines=${linesPerQuery}&offset=${linesOffset}`);

    console.log("GET: " + url);

    return this.http
      .get<ResponseAuthors[]>(url)
      .pipe(
        map(response => {

          const newAuthors: Author[] = [];

          for(const author of response) {
            newAuthors.push(new Author(
              author.id,
              author.name,
              "fake department",
              ["fake topic"],
              "https://avatars3.githubusercontent.com/u/12415265?s=40&v=4",
              4));
          }

          return newAuthors;
        })
      );

  }

  getAuthorFromId(authorId: string) {
    return new Author("fake", "fake", "fake", ["fake"], "fake", 3);//this.authors.find(author => author.id === authorId);
  }
}
