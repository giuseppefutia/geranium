import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

// Import models
import { Paper, SimplifiedPaper } from '../model/paper.model';
import { Topic, TopicNoImg } from '../model/topic.model';
import { SimplifiedAuthor } from '../model/simplified-author.model';
import { ModelService } from '../model/model.service';
import { ConfigService } from '../config/config.service';
import { Observable, of } from 'rxjs';
import { Author } from '../model/author.model';
import { Journal } from '../model/journal.model';

// Response interface
export interface ResponsePaper {
  id: string;
  title: string;
  author: SimplifiedAuthor;
  co_authors: SimplifiedAuthor[];
  topics: Topic[];
  submitted_date: string;
  abstract: string;
  suggested_topics: Topic[];
  suggested_co_authors: Author[];
  suggested_authors: Author[];
  suggested_journal: Journal[];
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
      this.config.apiDomain +
      ':' +
      this.config.apiPort +
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
              this.dataModel.shortenAuthorName(paper.author.name),
              paper.author.url
            )
          );
          for (const coAuthor of paper.co_authors) {
            authors.push(
              new SimplifiedAuthor(
                coAuthor.id,
                this.dataModel.shortenAuthorName(coAuthor.name),
                coAuthor.url
              )
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

          paper.suggested_co_authors.forEach(author_ => {
            author_.name = this.dataModel.normalizeAuthorName(author_.name);
            //author_.initials = this.dataModel.getInitials(author_.name);
          });
          this.dataModel.addPaper(
            new Paper(
              this.cleanID(paper.id),
              paper.title,
              paper.abstract,
              authors,
              topics,
              new Date(paper.submitted_date),
              imgUrl,
              paper.suggested_authors,
              paper.suggested_co_authors,
              paper.suggested_journal,
              paper.suggested_topics
            )
          );
        }
      })
    );
  }

  getPaperFromURI(paperURI: string): Observable<ResponsePaper[] | Paper> {
    const url =
      'https://' +
      this.config.apiDomain +
      ':' +
      this.config.apiPort +
      '/api?' +
      encodeURI(`type=publication&url=${paperURI}&lines=10000&offset=0`);

    console.log('GET: ' + url);

    if (
      this.dataModel.findPaperFromID(this.dataModel.paperURI2ID(paperURI)) !==
      undefined
    ) {
      this.dataModel.setPaperDetails(
        this.dataModel.findPaperFromID(this.dataModel.paperURI2ID(paperURI))
      );
      return of([]);
    }

    return this.http.get<ResponsePaper[]>(url).pipe(
      tap(response => {
        const paper: ResponsePaper = response[0];

        let authors: SimplifiedAuthor[] = [];
        authors.push(paper.author);
        paper.author.name = this.dataModel.shortenAuthorName(paper.author.name);
        paper.co_authors.forEach(
          author =>
            (author.name = this.dataModel.shortenAuthorName(author.name))
        );
        authors = authors.concat(paper.co_authors);

        paper.suggested_co_authors.forEach(author_ => {
          author_.name = this.dataModel.shortenAuthorName(author_.name);
          //author_.initials = this.dataModel.getInitials(author_.name);
        });
        this.dataModel.setPaperDetails(
          new Paper(
            paper.id,
            paper.title,
            paper.abstract,
            authors,
            paper.topics,
            new Date(paper.submitted_date),
            '',
            paper.suggested_authors,
            paper.suggested_co_authors,
            paper.suggested_journal,
            paper.suggested_topics
          )
        );
        console.log(this.dataModel.getPaperDetails());
      })
    );
  }

  private cleanID(dirty: string) {
    return dirty.replace('/', '-');
  }
}
