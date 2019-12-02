import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

// Import models
import { Paper } from '../model/paper.model';
import { Topic, TopicNoImg } from '../model/topic.model';
import { SimplifiedAuthor } from '../model/simplified-author.model';
import { ModelService } from '../model/model.service';
import { ConfigService } from '../config/config.service';

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
  constructor(
    private http: HttpClient,
    private dataModel: ModelService,
    private config: ConfigService
  ) {}

  /**
   * Send HTTP GET request for all the publications inherent a specific topic, passed as parameter.
   *
   * @param query the topic to be used for the search
   * @param block the current pagination block
   */
  getSimplifiedPapersBlock(topicQuery: TopicNoImg, block: number) {
    const linesPerQuery = 300;
    const linesOffset = linesPerQuery * block;
    const url =
      'https://' +
      this.config.apiDomain + ':' + this.config.apiPort +
      '/api?' +
      encodeURI(
        `type=publications&topic=${topicQuery.label}&lines=${linesPerQuery}&offset=${linesOffset}`
      );

    console.log('GET: ' + url);

    return this.http.get<ResponsePaper[]>(url).pipe(
      tap(response => {
        let topicImgChoosen = 0;
        for (const paper of response) {
          // build authors: for now authors and co-authors are processed together
          const authors: SimplifiedAuthor[] = [];

          authors.push(
            new SimplifiedAuthor(
              paper.author.id,
              paper.author.name,
              paper.author.url
            )
          );
          for (const coAuthor of paper.co_authors) {
            authors.push(
              new SimplifiedAuthor(coAuthor.id, coAuthor.name, coAuthor.url)
            );
          }

          // build topics
          const topics: Topic[] = [];
          for (const topic of paper.topics) {
            topics.push(
              new Topic(
                topic.url,
                this.dataModel.getWikiUrl(topic.url),
                topic.label,
                topic.img
              )
            );
          }

          // calculate topic index for selecting the image
          if (topicImgChoosen + 1 >= topics.length) {
            topicImgChoosen = 0;
          } else {
            topicImgChoosen++;
          }

          let imgUrl: string;
          if (
            /\.(gif|jpe?g|tiff|png|svg)(\?width=300)?$/i.test(
              topics[topicImgChoosen].img
            )
          ) {
            imgUrl = topics[topicImgChoosen].img;
          } else {
            imgUrl = 'assets/img/defaultPaper.jpg';
          }

          this.dataModel.addPaper(
            new Paper(
              this.cleanID(paper.id),
              paper.title,
              paper.abstract,
              authors,
              topics,
              new Date(paper.submitted_date),
              imgUrl
            )
          );
        }
      })
    );
  }

  getPaperFromId(paperId: string) {
    const res = this.dataModel.findPaperFromId(paperId);
    if (res === undefined) {
      // TODO: Query to server
    }
    return res;
  }

  private cleanID(dirty: string) {
    return dirty.replace('/', '-');
  }
}
