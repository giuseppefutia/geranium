import { Injectable } from '@angular/core';
import { PapersService } from './papers.service';
import { AuthorsService, ResponseAuthors } from './authors.service';
import { JournalsService } from './journals.service';
import { Journal } from '../model/journal.model';
import { Observable } from 'rxjs';
import { TopicNoImg} from '../model/topic.model';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {

  constructor(
    private papersService: PapersService,
    private authorsService: AuthorsService,
    private journalsService: JournalsService
  ) {}

  get journalsBlockSize(): number {
    return this.journalsService.blockSize;
  }

  getSimplifiedPapersBlock(topic: TopicNoImg, block: number) {
    return this.papersService.getSimplifiedPapersBlock(topic, block);
  }

  getPaperFromId(paperId: string) {
    return this.papersService.getPaperFromId(paperId);
  }

  // call service to request the author data
  getAuthorsBlock(topic: TopicNoImg, block: number): Observable<ResponseAuthors[]> {
    return this.authorsService.getAuthorsBlock(topic, block);
  }

  getAuthorFromURIandTopic(authorURI: string, topicLabel:string) {
    return this.authorsService.getAuthorFromURIandTopic(authorURI, topicLabel);
  }

  getJournalsBlock(query: string, block: number): Journal[] {
    return this.journalsService.getJournalsBlock(query, block);
  }

  getJournalFromId(journalId: string) {
    return this.journalsService.getJournalFromId(journalId);
  }
}
