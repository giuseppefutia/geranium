import { Injectable } from '@angular/core';
import { PapersService } from './papers.service';
import { AuthorsService, ResponseAuthors } from './authors.service';
import { JournalsService } from './journals.service';
import { Journal } from '../model/journal.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {

  constructor(
    private papersService: PapersService,
    private authorsService: AuthorsService,
    private journalsService: JournalsService,
    private http: HttpClient
  ) {}

  get journalsBlockSize(): number {
    return this.journalsService.blockSize;
  }

  getAllTopics() {
    const url = 'http://api.geranium.nexacenter.org/api?'
              + encodeURI(`type=topics&lines=100000&offset=0`);
    return this.http.get<string[]>(url);
  }

  getSimplifiedPapersBlock(query: string, block: number) {
    return this.papersService.getSimplifiedPapersBlock(query, block);
  }

  getPaperFromId(paperId: string) {
    return this.papersService.getPaperFromId(paperId);
  }

  // call service to request the author data
  getAuthorsBlock(query: string, block: number) : Observable<ResponseAuthors[]> {
    return this.authorsService.getAuthorsBlock(query, block);
  }

  getAuthorFromId(authorId: string) {
    return this.authorsService.getAuthorFromId(authorId);
  }

  getJournalsBlock(query: string, block: number): Journal[] {
    return this.journalsService.getJournalsBlock(query, block);
  }

  getJournalFromId(journalId: string) {
    return this.journalsService.getJournalFromId(journalId);
  }
}
