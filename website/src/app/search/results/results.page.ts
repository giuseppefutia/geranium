import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PapersService } from '../services/papers.service';
import { IonSlides, NavController, ModalController } from '@ionic/angular';
import { Paper } from '../models/paper.model';
import { PaperDetailComponent } from './paper-detail/paper-detail.component';

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
  allPapers: Paper[];
  showedPapers: Paper[];

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
    private papersService: PapersService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('searchKey')) {
        this.navCtrl.navigateBack(['/']);
        return;
      }
      this.searchKey = paramMap.get('searchKey');
      this.allPapers = this.papersService.getPapers(this.searchKey);
      this.showedPapers = this.allPapers;
    });
  }

  onPaperDetailClick(id: string) {
    this.allPapers.find(el => el.id === id);
    this.modalCtrl
      .create({
        component: PaperDetailComponent,
        componentProps: { selectedPaper: this.showedPapers.find(el => el.id === id) }
      })
      .then(modalEl => {
        modalEl.present();
      });
  }

  papersTransitionEnd() {
    this.papersSlides.getActiveIndex().then(actIndex => {
      this.papersSlides.length().then(len => {
        if (actIndex >= len - 10) {
          this.papersSlides.lockSwipes(true).then();
          // Add papers to showedPapers
          this.showedPapers = this.showedPapers.concat(
            this.papersService.getPapers('abc')
          );
          this.papersSlides.update().then();
          this.papersSlides.lockSwipes(false).then();
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
      this.journalsSlides.slideTo(i + 3).then();
    });
  }

  journalsRight() {
    this.journalsSlides.getActiveIndex().then(i => {
      this.journalsSlides.slideTo(i + 3).then();
    });
  }
}
