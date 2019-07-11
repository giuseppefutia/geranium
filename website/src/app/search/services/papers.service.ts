import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthorsService } from './authors.service';
import { map } from 'rxjs/operators';

// Import models
import { Paper } from '../models/paper.model';
import { SimplifiedPaper } from '../models/simplified-paper.model';
import { SimplifiedAuthor } from '../models/simplified-author.model';
import { Topic } from '../models/topic.model';

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
  private papers: Paper[] = [];

  constructor(private http: HttpClient) {}

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
      map(response => {
        const newPapers: SimplifiedPaper[] = [];
        console.log(response);

        var topicImgChoosen: number = 0;
        for (const paper of response) {

          console.log(topicImgChoosen);
          // build authors: for now authors and co-authors are processed together
          const authors: SimplifiedAuthor[] = [];
          const author = new SimplifiedAuthor(
            paper.author.id,
            paper.author.name,
            paper.author.url
          );

          for (const co_author of paper.co_authors) {
            authors.push(
              new SimplifiedAuthor(co_author.id, co_author.name, co_author.url)
            );
          }

          // build topics
          const topics: Topic[] = [];
          for (let i = 0; i < paper.topics.length; i++) {
            const topic = paper.topics[i];
            topics.push(new Topic(topic.url, topic.label, topic.img));
          }

          // calculate topic index for selecting the image
          if(topicImgChoosen+1 >= topics.length)
            topicImgChoosen = 0;
          else 
            topicImgChoosen++;
      
          // build paper
          newPapers.push(
            new SimplifiedPaper(
              this.cleanID(paper.id),
              paper.title,
              authors,
              topics,
              new Date(paper.submitted_date),
              topics[topicImgChoosen].img
            )
          );

          this.papers.push(
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

        return newPapers;
      })
    );
  }

  private cleanID(dirty: string) {
    return dirty.replace('/', '-');
  }

  getPaperFromId(id: string): Paper {
    return this.papers.find(p => p.id === id);
  }
}
