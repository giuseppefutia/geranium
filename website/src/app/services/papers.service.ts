import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

// Import models
import { Paper } from '../model/paper.model';
import { Topic } from '../model/topic.model';
import { SimplifiedAuthor } from '../model/simplified-author.model';
import { ModelService } from '../model/model.service';

// Response interface
export interface ResponsePaper {
  id: string;
  title: string;
  author: SimplifiedAuthor;
  co_authors: SimplifiedAuthor[];
  topics: Topic[];
  submitted_date: string;
  abstract: string;
}

@Injectable({
  providedIn: 'root'
})
export class PapersService {

  constructor(private http: HttpClient, private dataModel: ModelService) {}

  /**
   * Send HTTP GET request for all the publications inherent a specific topic, passed as parameter.
   *
   * @param query the topic to be used for the search
   * @param block the current pagination block
   */
  getSimplifiedPapersBlock(query: string, block: number) {
    const linesPerQuery = 300;
    const linesOffset = linesPerQuery * block;
    const url =
      'http://api.geranium.nexacenter.org/api?' +
      encodeURI(
        `type=publications&topic=${query}&lines=${linesPerQuery}&offset=${linesOffset}`
      );

    console.log('GET: ' + url);

    return this.http.get<ResponsePaper[]>(url).pipe(
      tap(response => {
        let topicImgChoosen: number = 0;
        for (const paper of response) {
          // build authors: for now authors and co-authors are processed together
          const authors: SimplifiedAuthor[] = [];

          for (const co_author of paper.co_authors) {
            authors.push(
              new SimplifiedAuthor(co_author.id, co_author.name, co_author.url)
            );
          }

          // build topics
          const topics: Topic[] = [];
          for (const topic of paper.topics) {
            topics.push(new Topic(topic.url, topic.label, topic.img));
          }

          // calculate topic index for selecting the image
          if (topicImgChoosen + 1 >= topics.length) {
            topicImgChoosen = 0;
          } else {
            topicImgChoosen++;
          }

          this.dataModel.addPaper(
            new Paper(
              this.cleanID(paper.id),
              paper.title,
              paper.abstract,
              authors,
              topics,
              new Date(paper.submitted_date),
              topics[topicImgChoosen].img
            )
          );
        }
      })
    );
  }

  getPaperFromId(paperId: string) {
    const res = this.dataModel.getPaperFromId(paperId);
    if (res === undefined) {
      // TODO: Query to server
    }
    return res;
  }

  private cleanID(dirty: string) {
    return dirty.replace('/', '-');
  }
}
