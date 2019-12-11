import { Injectable } from '@angular/core';
import { PapersService, ResponsePaper } from './papers.service';
import { AuthorsService, ResponseAuthors } from './authors.service';
import { JournalsService } from './journals.service';
import { Journal } from '../model/journal.model';
import { Observable } from 'rxjs';
import { TopicNoImg} from '../model/topic.model';
import { Paper } from '../model/paper.model';

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

  getPaperFromURI(paperId: string): Observable<ResponsePaper[] | Paper> {
    return this.papersService.getPaperFromURI(paperId);
  }

  // call service to request the author data
  getAuthorsBlock(topic: TopicNoImg, block: number): Observable<ResponseAuthors[]> {
    return this.authorsService.getAuthorsBlock(topic, block);
  }

  getAuthorFromIDandTopic(authorURI: string, topicLabel: string) {
    return this.authorsService.getAuthorFromIDandTopic(authorURI, topicLabel);
  }

  getJournalsBlock(query: string, block: number): Journal[] {
    return this.journalsService.getJournalsBlock(query, block);
  }

  getJournalFromId(journalId: string) {
    return this.journalsService.getJournalFromId(journalId);
  }
}
