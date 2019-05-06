import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResultsService } from '../services/results.service';
import { IonSlides, NavController, ModalController } from '@ionic/angular';
import { PaperDetailComponent } from './paper-detail/paper-detail.component';
import { SimplifiedPaper } from '../models/simplified-paper.model';
import { SimplifiedAuthor } from '../models/simplified-author.model';
import { AuthorDetailComponent } from './author-detail/author-detail.component';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss']
})
export class ResultsPage implements OnInit {
  @ViewChild('papersSlides') papersSlides: IonSlides;
  @ViewChild('authorsSlides') authorsSlides: IonSlides;
  @ViewChild('journalsSlides') journalsSlides: IonSlides;
  searchKey: string;
  allPapers: SimplifiedPaper[];
  showedPapers = new Array<SimplifiedPaper>();
  showedAuthors = new Array<SimplifiedAuthor>();
  showedJournals = new Array<string>();
  topViewVisible = false;
  private showedCount = 0;
  isUpdating = false;
  isLoading = true;

  papersOpts = {
    zoom: false,
    slidesPerView: 4.3,
    grabCursor: true,
    spaceBetween: 5,
    centeredSlides: false,
    breakpoints: {
      550: {
        slidesPerView: 1
      },
      768: {
        slidesPerView: 2.2
      },
      1200: {
        slidesPerView: 3.2
      }
    }
  };

  authorsOpts = {
    zoom: false,
    slidesPerView: 6.5,
    grabCursor: true,
    spaceBetween: 5,
    centeredSlides: false,
    breakpoints: {
      350: {
        slidesPerView: 1.5
      },
      550: {
        slidesPerView: 2.5
      },
      768: {
        slidesPerView: 3.5
      },
      1000: {
        slidesPerView: 4.5
      },
      1200: {
        slidesPerView: 5.5
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private resultsService: ResultsService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('searchKey')) {
        this.navCtrl.navigateBack(['/']);
        return;
      }
      this.searchKey = paramMap.get('searchKey');
    });
    this.addDummySlides(6);
    setTimeout(() => {
      this.allPapers = this.resultsService.getSimplifiedPapers(this.searchKey);
      this.allPapers = this.allPapers.concat(this.allPapers);
      this.allPapers = this.allPapers.concat(this.allPapers);
      this.allPapers = this.allPapers.concat(this.allPapers);
      this.allPapers = this.allPapers.concat(this.allPapers);
      this.allPapers = this.allPapers.concat(this.allPapers);
      this.showedPapers = [];
      this.showedAuthors = [];
      this.showedJournals = [];
      this.addToShowedPapers(10);
      this.isLoading = false;
      this.topViewVisible = true;
    }, 2000);
  }

  addDummySlides(howmany: number) {
    let i: number;
    for (i = 0; i < howmany; i++) {
      this.showedPapers.push(
        new SimplifiedPaper('', '', [new SimplifiedAuthor('', '')], [''])
      );
      this.showedAuthors.push(new SimplifiedAuthor('', ''));
      this.showedJournals.push('');
    }
  }

  addToShowedPapers(howmany: number) {
    let i: number;
    let found: boolean;
    for (
      i = this.showedCount;
      i < howmany + this.showedCount && i < this.allPapers.length;
      i++
    ) {
      // Add to papers
      this.showedPapers.push(this.allPapers[i]);
      // Add to authors
      for (const author of this.allPapers[i].authors) {
        found = false;
        for (const added of this.showedAuthors) {
          if (added.id === author.id) {
            found = true;
          }
        }
        if (!found) {
          this.showedAuthors.push(author);
        }
      }
      // Add to journals
      for (const journal of this.allPapers[i].journals) {
        this.showedJournals.push(journal);
      }
    }
    this.showedCount = i;
  }

  authorsToStringArray(paper: SimplifiedPaper): string[] {
    const temp = new Array<string>();
    for (const author of paper.authors) {
      temp.push(author.name);
    }
    return temp;
  }

  onPaperDetailClick(id: string) {
    this.modalCtrl
      .create({
        component: PaperDetailComponent,
        componentProps: {
          selectedPaperId: id
        }
      })
      .then(modalEl => {
        modalEl.present();
      });
  }

  onAuthorSlideClick(author: SimplifiedAuthor) {
    this.modalCtrl
      .create({
        component: AuthorDetailComponent,
        componentProps: { authorId: author.id }
      })
      .then(modalEl => {
        modalEl.present();
      });
  }

  papersTransitionEnd() {
    this.papersSlides.getActiveIndex().then(actIndex => {
      this.papersSlides.length().then(len => {
        if (actIndex >= len - 10) {
          this.papersSlides
            .lockSwipes(true)
            .then(() => (this.isUpdating = true));
          this.addToShowedPapers(6);
          this.papersSlides.update().then();
          this.papersSlides
            .lockSwipes(false)
            .then(() => (this.isUpdating = false));
        }
      });
    });
  }

  papersLeft() {
    this.papersSlides.getActiveIndex().then(i => {
      this.papersSlides.slideTo(i - 3).then();
    });
  }

  papersRight() {
    this.papersSlides.getActiveIndex().then(i => {
      this.papersSlides.slideTo(i + 3).then();
    });
  }

  authorsLeft() {
    this.authorsSlides.getActiveIndex().then(i => {
      this.authorsSlides.slideTo(i - 3).then();
    });
  }

  authorsRight() {
    this.authorsSlides.getActiveIndex().then(i => {
      this.authorsSlides.slideTo(i + 3).then();
    });
  }

  journalsLeft() {
    this.journalsSlides.getActiveIndex().then(i => {
      this.journalsSlides.slideTo(i - 3).then();
    });
  }

  journalsRight() {
    this.journalsSlides.getActiveIndex().then(i => {
      this.journalsSlides.slideTo(i + 3).then();
    });
  }
}
