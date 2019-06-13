import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterContentInit
} from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { SimplifiedPaper } from '../../models/simplified-paper.model';
import { Chart } from 'chart.js';
import { SimplifiedAuthor } from '../../models/simplified-author.model';
import { PaperDetailComponent } from '../paper-detail/paper-detail.component';
import { ActivatedRoute } from '@angular/router';
import { ResultsService } from '../../services/results.service';

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
  selector: 'app-papers',
  templateUrl: './papers.page.html',
  styleUrls: ['./papers.page.scss']
})
export class PapersPage implements OnInit {
  @ViewChild('barCanvas') barCanvas: ElementRef;

  primaryColor = 'rgba(44, 101, 201, 0.5)';
  lightColor = 'rgba(44, 101, 201, 0.2)';
  hiddenColor = 'rgba(0, 0, 0, 0.5)';
  lightHiddenColor = 'rgba(0, 0, 0, 0.05)';
  topicChart: Chart;
  allPapersYears: YearsData[] = [];
  papersCount = 0;
  papersYears = 0;
  currentBlock = 0;

  searchKey: string;
  allPapers: SimplifiedPaper[] = [];
  filteredPapers: SimplifiedPaper[] = [];

  isLoading = false;
  isRedirecting = false;
  endOfResults = false;

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
              beginAtZero: true,
              callback(value) {
                if (value % 1 === 0) {
                  // To show only integer numbers
                  return value;
                }
              }
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
    private navCtrl: NavController,
    private resultsService: ResultsService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('searchKey')) {
        this.searchKey = paramMap.get('searchKey');
        this.resultsService.searchKey = this.searchKey;
      } else {
        if (this.resultsService.searchKey === '') {
          this.navCtrl.navigateBack(['/search']);
          return;
        } else {
          this.searchKey = this.resultsService.searchKey;
          this.isRedirecting = true;
          this.navCtrl.navigateForward([
            '/',
            'results',
            'tabs',
            'papers',
            this.searchKey
          ]);
        }
      }
    });
  }

  ionViewDidEnter() {
    if (!this.isRedirecting) {
      this.fetchData();
    }
  }

  fetchData() {
    this.isLoading = true;
    this.addDummySlides(10);

    const maxTopicsPerCard = 4;

    this.resultsService
      .getSimplifiedPapersBlock(this.searchKey, this.currentBlock)
      .subscribe(newPapers => {
        this.filteredPapers = [];
        this.isLoading = false;
        if (newPapers.length === 0) {
          // If there are no results
          this.endOfResults = true;
          console.log('end');
        } else {

          for (const newPaper of newPapers) {
            newPaper.topics = this.filterTopics(
              newPaper.topics,
              maxTopicsPerCard
            );
            this.allPapers.push(newPaper);
          }
          this.currentBlock++;

          this.updatePapersYears(newPapers);
          this.papersCount = this.allPapers.length;
          this.papersYears =
            new Date().getFullYear() -
            Number.parseInt(this.allPapersYears[0].year, 10);

          this.filterPapers();

          if (this.currentBlock === 1) {
            setTimeout(() => {
              this.createChart();
            }, 300);
          } else {
            this.updateChart();
          }
        }
      });
  }

  filterTopics(topics: string[], topicsLimit: number): string[] {
    return topics
      .filter(topic => topic.toLowerCase() !== this.searchKey.toLowerCase())
      .slice(0, topicsLimit > topics.length ? topics.length : topicsLimit);
  }

  openNewTab(url: string) {
    window.open(url, '_blank');
  }

  onTopicChipClick(topic: string) {
    this.resultsService.searchKey = topic;
    this.navCtrl.navigateForward(['/', 'results', 'tabs', 'papers', topic]);
  }

  // Called by infinite scroll to load more data
  onMorePapers(event) {
    // disable the infinite scroll
    if (this.endOfResults === true) {
      event.target.disabled = true;
    }

    this.fetchData();
    this.updateChart();
    event.target.complete();
  }

  // Open modal when clicked on MORE in a card
  onPaperDetails(paper: SimplifiedPaper) {
    this.modalCtrl
      .create({
        component: PaperDetailComponent,
        componentProps: { selectedPaperId: paper.id }
      })
      .then(modalEl => {
        modalEl.present();
      });
  }

  // Called when top button is clicked -> returns to search page
  onBackClick() {
    if (this.resultsService.isFirstSearch) {
      this.navCtrl.navigateBack(['/', 'search']);
    } else {
      this.navCtrl.back();
    }
  }

  // Converts the array of SimplifiedAuthors in the <paper> argument in an
  // array of strings (authors' names) used in HTML
  authorsToStringArray(paper: SimplifiedPaper): string[] {
    const temp = new Array<string>();
    for (const author of paper.authors) {
      temp.push(author.name);
    }
    return temp;
  }

  // Adjusts the configuration of the chart in the top view and shows it
  createChart() {
    this.chartData.datasets[0].label = '# of publications';
    this.updateChartData();
    this.chartOpts.data = this.chartData;
    this.topicChart = new Chart(this.barCanvas.nativeElement, this.chartOpts);
  }

  // Update chart with newly fetched data
  updateChart() {
    this.updateChartData();
    this.topicChart.update();
  }

  // Maps the new received data in the graph view
  updateChartData() {
    this.chartData.labels = this.allPapersYears.map(el => el.year);
    this.chartData.datasets[0].data = this.allPapersYears.map(el => el.papers);
    this.chartData.datasets[0].backgroundColor = new Array<string>(
      this.allPapersYears.length
    );
    this.chartData.datasets[0].borderColor = new Array<string>(
      this.allPapersYears.length
    );
    for (let i = 0; i < this.allPapersYears.length; i++) {
      this.chartData.datasets[0].backgroundColor[i] =
        this.allPapersYears[i].shown === true
          ? this.lightColor
          : this.lightHiddenColor;
      this.chartData.datasets[0].borderColor[i] =
        this.allPapersYears[i].shown === true
          ? this.primaryColor
          : this.hiddenColor;
    }
  }

  // Updates the allPapersYears array containing information about
  // the number of papers for each year sorted by ascending year number with newly received papers
  updatePapersYears(newPapers: SimplifiedPaper[]) {
    let found: boolean;
    for (const newPaper of newPapers) {
      found = false;
      for (const el of this.allPapersYears) {
        if (newPaper.publicationDate.getFullYear().toString() === el.year) {
          el.papers++;
          found = true;
        }
      }
      if (found === false) {
        this.allPapersYears.push(
          new YearsData(
            newPaper.publicationDate.getFullYear().toString(),
            1,
            true
          )
        );
      }
    }
    this.allPapersYears.sort(
      (a, b) => Number.parseInt(a.year, 10) - Number.parseInt(b.year, 10)
    );
  }

  // Called when a bar on the chart is clicked
  // It filters the year corresponding to the clicked bar from allPapers
  // and puts result in filteredPapers
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
    this.filterPapers();
    // Update grid (is automatic)
    this.topicChart.update();
  }

  // The allPapers array is filtered by the value of allPapersYears[i].shown
  // corresponding to each year. The result is stored in filteredPapers
  filterPapers() {
    this.filteredPapers = this.allPapers.filter(el => {
      return (
        this.allPapersYears.find(
          y =>
            el.publicationDate.getFullYear().toString() === y.year &&
            y.shown === true
        ) !== undefined
      );
    });
  }

  // Adds dummy slides while fetching data
  addDummySlides(howmany: number) {
    let i: number;
    for (i = 0; i < howmany; i++) {
      this.filteredPapers.push(
        new SimplifiedPaper(
          '',
          '',
          [new SimplifiedAuthor('', '')],
          [''],
          new Date(''),
          ''
        )
      );
    }
  }
}
