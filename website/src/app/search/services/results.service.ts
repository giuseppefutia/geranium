import { Injectable } from '@angular/core';
import { PapersService } from './papers.service';
import { AuthorsService } from './authors.service';
import { JournalsService } from './journals.service';
import { SimplifiedPaper } from '../models/simplified-paper.model';
import { Paper } from '../models/paper.model';
import { Author } from '../models/author.model';
import { Journal } from '../models/journal.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  private prevKey = '';
  private searchKey_ = '';
  private searchCount = 0;
  private _firstSearch = true;

  constructor(
    private papersService: PapersService,
    private authorsService: AuthorsService,
    private journalsService: JournalsService
  ) {}

  get journalsBlockSize(): number {
    return this.journalsService.blockSize;
  }
  get isFirstSearch(): boolean {
    return this._firstSearch;
  }
  get searchKey(): string {
    return this.searchKey_;
  }
  set searchKey(key: string) {
    if (key !== this.prevKey) {
      this.searchKey_ = key;
      this.searchCount++;
      if (this.searchCount > 1) {
        this._firstSearch = false;
      }
    }
  }

  getSimplifiedPapersBlock(query: string, block: number) {
    return this.papersService.getSimplifiedPapersBlock(query, block);
  }

  getPaperFromId(id: string): Paper {
    return this.papersService.getPaperFromId(id);
  }

  // call service to request the author data
  getAuthorsBlock(query: string, block: number) : Observable<Author[]> {
    return this.authorsService.getAuthorsBlock(query, block);
  }

  simplifyAuthorName(name: string): string {
    return this.authorsService.simplifyAuthorName(name);
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
