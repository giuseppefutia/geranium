import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, IonSlides } from '@ionic/angular';
import { PapersService } from '../services/papers.service';
import { Paper } from '../models/paper.model';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss']
})
export class ResultsPage implements OnInit {
  @ViewChild('papersSlides') slides: IonSlides;
  allPapers: Paper[];
  showedPapers: Paper[];

  sliderOpts = {
    zoom: false,
    slidesPerView: 4.5,
    grabCursor: true,
    spaceBetween: 5,
    centeredSlides: false,
    breakpoints: {
      // Ionic Responsive Grid breakpoints
      520: {
        slidesPerView: 1,
        spaceBetween: 5
      },
      720: {
        slidesPerView: 2.2,
        spaceBetween: 5
      },
      960: {
        slidesPerView: 3.2,
        spaceBetween: 5
      },
      1140: {
        slidesPerView: 4.2,
        spaceBetween: 5
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private papersService: PapersService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('searchKey')) {
        this.navCtrl.navigateBack(['/']);
        return;
      }
      const searchKey = paramMap.get('searchKey');
      this.allPapers = this.papersService.getPapers();
      this.showedPapers = this.allPapers;
    });
  }

  onTransitionEnd() {
    this.slides.getActiveIndex().then(actIndex => {
      this.slides.length().then(len => {
        if (actIndex >= len - 10) {
          this.slides.lockSwipes(true).then();
          // Add papers to showedPapers
          this.showedPapers = this.showedPapers.concat(
            this.papersService.getPapers()
          );
          this.slides.update().then();
          this.slides.lockSwipes(false).then();
        }
      });
    });
  }

  goLeft() {
    this.slides.getActiveIndex().then(i => {
      this.slides.slideTo(i - 3).then();
    });
  }

  goRight() {
    this.slides.getActiveIndex().then(i => {
      this.slides.slideTo(i + 3).then();
    });
  }
}
