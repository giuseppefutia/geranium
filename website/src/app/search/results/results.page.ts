import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResultsService } from '../services/results.service';
import { IonSlides, NavController, ModalController } from '@ionic/angular';
import { Chart, ChartConfiguration } from 'chart.js';

import { PaperDetailComponent } from './paper-detail/paper-detail.component';
import { SimplifiedPaper } from '../models/simplified-paper.model';
import { SimplifiedAuthor } from '../models/simplified-author.model';
import { AuthorDetailComponent } from './author-detail/author-detail.component';

class YearsData {
  constructor(
    public year: string,
    public papers: number,
    public shown: boolean
  ) {}
}

class BarData {
  constructor(public datasetIndex: number, public dataIndex: number) {}
}

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss']
})
export class ResultsPage implements OnInit, AfterViewInit {
  @ViewChild('papersSlides') papersSlides: IonSlides;
  @ViewChild('authorsSlides') authorsSlides: IonSlides;
  @ViewChild('journalsSlides') journalsSlides: IonSlides;
  @ViewChild('barCanvas') barCanvas: ElementRef;

  primaryColor = 'rgba(44, 101, 201, 0.5)';
  lightColor = 'rgba(44, 101, 201, 0.2)';
  hiddenColor = 'rgba(0, 0, 0, 0.5)';
  lightHiddenColor = 'rgba(0, 0, 0, 0.05)';
  topicChart: Chart;
  searchKey: string;
  allPapers: SimplifiedPaper[];
  allPapersYears: YearsData[] = [];
  filteredPapers: SimplifiedPaper[] = [];
  private showedCount = 0;

  showedPapers: SimplifiedPaper[] = [];
  showedAuthors: SimplifiedAuthor[] = [];
  showedJournals: string[] = [];
  topViewVisible = false;
  isUpdating = false;
  isLoading = true;
  papersCount = 0;
  papersYears = 0;

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

  chartData = {
    labels: [], // Must be configured with appropriate data
    datasets: [
      {
        label: '', // Must be configured with appropriate data
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }
    ]
  };

  chartOpts = {
    type: 'bar',
    data: {},
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ],
        xAxes: [
          {
            barPercentage: 1
          }
        ]
      },
      onClick: (v, e) => {
        this.onChartClick.call(
          this,
          new BarData(e[0]._datasetIndex, e[0]._index)
        );
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
  }

  ngAfterViewInit() {
    this.addDummySlides(6);
    setTimeout(() => {
      this.fetchData();
      this.showedPapers = [];
      this.showedAuthors = [];
      this.showedJournals = [];
      this.addToShowedPapers(10);
      this.isLoading = false;
      this.topViewVisible = true;
      setTimeout(() => {
        this.createChart();
      }, 500);
    }, 2000);
  }

  fetchData() {
    this.allPapers = this.resultsService.getSimplifiedPapers(this.searchKey);
    this.allPapers = this.allPapers.concat(this.allPapers);
    this.allPapers = this.allPapers.concat(this.allPapers);
    this.allPapers = this.allPapers.concat(this.allPapers);
    this.allPapers = this.allPapers.concat(this.allPapers);
    this.allPapers = this.allPapers.concat(this.allPapers);
    this.filteredPapers = [...this.allPapers];
    this.papersCount = this.allPapers.length;
    this.allPapersYears = this.getPapersYears();
    this.papersYears =
      new Date().getFullYear() -
      Number.parseInt(this.allPapersYears[0].year, 10);
  }

  getPapersYears() {
    let i: number;
    const data: YearsData[] = [];
    let found = false;
    for (i = 0; i < this.allPapers.length; i++) {
      found = false;
      for (const el of data) {
        if (
          this.allPapers[i].publicationDate.getFullYear().toString() === el.year
        ) {
          el.papers++;
          found = true;
        }
      }
      if (found === false) {
        data.push(
          new YearsData(
            this.allPapers[i].publicationDate.getFullYear().toString(),
            1,
            true
          )
        );
      }
    }
    data.sort(
      (a, b) => Number.parseInt(a.year, 10) - Number.parseInt(b.year, 10)
    );
    return data;
  }

  createChart() {
    this.chartData.labels = this.allPapersYears.map(el => el.year);
    this.chartData.datasets[0].label = '# of publications';
    this.chartData.datasets[0].data = this.allPapersYears.map(el => el.papers);
    this.chartData.datasets[0].backgroundColor = new Array<string>(
      this.allPapersYears.length
    );
    this.chartData.datasets[0].borderColor = new Array<string>(
      this.allPapersYears.length
    );
    for (let i = 0; i < this.allPapersYears.length; i++) {
      this.chartData.datasets[0].backgroundColor[i] = this.lightColor;
      this.chartData.datasets[0].borderColor[i] = this.primaryColor;
    }
    this.chartOpts.data = this.chartData;
    this.topicChart = new Chart(this.barCanvas.nativeElement, this.chartOpts);
  }

  onChartClick(bar: BarData) {
    this.allPapersYears[bar.dataIndex].shown = !this.allPapersYears[
      bar.dataIndex
    ].shown;
    this.chartData.datasets[bar.datasetIndex].backgroundColor[bar.dataIndex] =
      this.allPapersYears[bar.dataIndex].shown === true
        ? this.lightColor
        : this.lightHiddenColor;
    this.chartData.datasets[bar.datasetIndex].borderColor[bar.dataIndex] =
      this.allPapersYears[bar.dataIndex].shown === true
        ? this.primaryColor
        : this.hiddenColor;
    this.filteredPapers = this.allPapers.filter(el => {
      return (
        this.allPapersYears.find(
          y =>
            el.publicationDate.getFullYear().toString() === y.year &&
            y.shown === true
        ) !== undefined
      );
    });
    this.showedCount = 0;
    this.showedPapers = [];
    this.showedAuthors = [];
    this.showedJournals = [];
    this.addToShowedPapers(10);
    this.papersSlides.update().then();
    this.topicChart.update();
  }

  addDummySlides(howmany: number) {
    let i: number;
    for (i = 0; i < howmany; i++) {
      this.showedPapers.push(
        new SimplifiedPaper(
          '',
          '',
          [new SimplifiedAuthor('', '')],
          [''],
          new Date('')
        )
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
      i < howmany + this.showedCount && i < this.filteredPapers.length;
      i++
    ) {
      // Add to papers
      this.showedPapers.push(this.filteredPapers[i]);
      // Add to authors
      for (const author of this.filteredPapers[i].authors) {
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
      for (const journal of this.filteredPapers[i].journals) {
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
