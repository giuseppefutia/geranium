import { Component, OnInit, AfterContentInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { PapersService } from '../../services/papers.service';
import { ActivatedRoute } from '@angular/router';
import { Journal } from '../../models/journal.model';
import { JournalsService } from '../../services/journals.service';
import { JournalDetailComponent } from '../journal-detail/journal-detail.component';

@Component({
  selector: 'app-journals',
  templateUrl: './journals.page.html',
  styleUrls: ['./journals.page.scss'],
})
export class JournalsPage implements OnInit, AfterContentInit {
  currentBlock = 0;

  searchKey: string;
  allJournals: Journal[] = [];

  isLoading = false;
  isRedirecting = false;
  endOfResults = false;

  constructor(
    private navCtrl: NavController,
    private papersService: PapersService,
    private journalsService: JournalsService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('searchKey')) {
        this.searchKey = paramMap.get('searchKey');
        this.papersService.searchKey = this.searchKey;
      } else {
        if (this.papersService.searchKey === '') {
          this.navCtrl.navigateBack(['/search']);
          return;
        } else {
          this.searchKey = this.papersService.searchKey;
          this.isRedirecting = true;
          this.navCtrl.navigateForward([
            '/',
            'results',
            'tabs',
            'journals',
            this.searchKey
          ]);
        }
      }
    });
  }

  ngAfterContentInit() {
    if (!this.isRedirecting) {
      this.fetchData();
    }
  }

  fetchData() {
    this.isLoading = true;
    this.addDummySlides(10);
    setTimeout(() => {
      this.isLoading = false;
      this.allJournals = [];
      this.addToShowedJournals(10);
    }, 2000);
  }

  filterTopics(topics: string[], topicsLimit: number): string[] {
    return topics
      .filter(topic => topic.toLowerCase() !== this.searchKey.toLowerCase())
      .slice(0, topicsLimit > topics.length ? topics.length : topicsLimit);
  }

  // Add papers that will actually be shown in the grid
  addToShowedJournals(atleast: number) {
    const maxTopicsPerCard = 4;
    const oldAll = this.allJournals.length;
    while (1) {
      const temp = this.journalsService.getJournalsBlock(
        this.searchKey,
        this.currentBlock
      );
      if (temp.length === 0) {
        // If there are no results
        this.endOfResults = true;
        break;
      }
      for (const newJournal of temp) {
        newJournal.topics = this.filterTopics(
          newJournal.topics,
          maxTopicsPerCard
        );
        this.allJournals.push(newJournal);
      }
      this.currentBlock++;

      if (temp.length !== this.journalsService.blockSize) {
        // If the length of the results of the last block
        // is not the size of a block, than results have ended
        // which in turn disables the infinite-scroll
        this.endOfResults = true;
        break;
      }
      if (this.allJournals.length - oldAll >= atleast) {
        break;
      }
    }
  }

  openNewTab(url: string) {
    window.open(url, '_blank');
  }

  // Called by infinite scroll to load more data
  onMoreJournals(event) {
    setTimeout(() => {
      this.addToShowedJournals(10);
      event.target.complete();

      // disable the infinite scroll
      if (this.endOfResults === true) {
        event.target.disabled = true;
      }
    }, 1500);
  }

  // Open modal when clicked on MORE in a card
  onJournalDetails(journal: Journal) {
    this.modalCtrl
      .create({
        component: JournalDetailComponent,
        componentProps: { selectedJournal: journal }
      })
      .then(modalEl => {
        modalEl.present();
      });
  }

  // Called when top button is clicked -> returns to search page
  onBackClick() {
    this.navCtrl.navigateBack(['/', 'search']);
  }

  // Adds dummy slides while fetching data
  addDummySlides(howmany: number) {
    let i: number;
    for (i = 0; i < howmany; i++) {
      this.allJournals.push(
        new Journal(
          '',
          '',
          '',
          '',
          ['']
        )
      );
    }
  }
}