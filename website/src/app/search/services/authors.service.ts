import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Import models
import { Author } from '../models/author.model';
import { Topic } from '../models/topic.model';

// Set interfaces to parse data
interface Publication {
    id: string;
    title: string;
    author: Author;
    co_authors: Author[];
    topics: Topic[];
    submittedDate: string;
}

export interface ResponseAuthors {
  id: string;
  name: string;
  url: string;
  publications_on_topic: Publication[]
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

    const linesPerQuery = 300;
    const linesOffset = linesPerQuery * block;
    const url = 'http://api.geranium.nexacenter.org/api?'
              + encodeURI(`type=authors&topic=${query}&lines=${linesPerQuery}&offset=${linesOffset}`);

    console.log("GET: " + url);

    return this.http
      .get<ResponseAuthors[]>(url)
      .pipe(
        map(response => {
          const newAuthors: Author[] = [];
          for (const author of response) {
            // Get the most common topics
            var allTopics: {url: string,
                            label: string,
                            occ: number}[] = [];
            for (const publication of author['publications_on_topic']) {
              for (const topic of publication['topics']) {
                if (allTopics.find(x=>x.url == topic.url) != undefined) {
                  // TODO
                }
              }
            }
            newAuthors.push(new Author(
              author.id,
              author.name,
              "",
              ["fake topic"],
              "https://avatars3.githubusercontent.com/u/12415265?s=40&v=4",
              author['publications_on_topic'].length));
          }
          return newAuthors;
        })
      );

  }

  getAuthorFromId(authorId: string) {
    return new Author("fake", "fake", "fake", ["fake"], "fake", 3);//this.authors.find(author => author.id === authorId);
  }
}
