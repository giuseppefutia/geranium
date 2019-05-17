import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { NavController } from '@ionic/angular';
import { ResultsService } from '../../services/results.service';
import { SimplifiedPaper } from '../../models/simplified-paper.model';
import { Chart } from 'chart.js';
import { SimplifiedAuthor } from '../../models/simplified-author.model';

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
export class PapersPage implements OnInit, AfterViewInit {
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
                  return value;
                }
              } // To show only integer numbers
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
    private resultsService: ResultsService
  ) {}

  ngOnInit() {
    if (this.resultsService.searchKey === '') {
      this.navCtrl.navigateBack(['/search']);
    } else {
      this.searchKey = this.resultsService.searchKey;
    }
  }

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    this.addToShowedPapers(10);

    setTimeout(() => {
      this.createChart();
    }, 300);
  }

  // Add papers that will actually be shown in the grid
  addToShowedPapers(atleast: number) {
    while (1) {
      const temp = this.resultsService.getSimplifiedPapersBlock(
        this.searchKey,
        this.currentBlock
      );
      if (temp.length === 0) {
        // If there are no results
        break;
      }
      for (const newPaper of temp) {
        this.allPapers.push(newPaper);
      }
      this.currentBlock++;

      this.allPapersYears = this.getPapersYears();
      this.papersCount = this.allPapers.length;
      this.papersYears =
        new Date().getFullYear() -
        Number.parseInt(this.allPapersYears[0].year, 10);

      this.filterPapers();
      if (temp.length !== this.resultsService.blockSize) {
        this.endOfResults = true;
        break;
      }
      if (this.filteredPapers.length >= atleast) {
        break;
      }
    }
    //this.topicChart.update();
  }

  // Called by infinite scroll to load more data
  onMorePapers(event) {
    setTimeout(() => {
      this.addToShowedPapers(10);
      event.target.complete();

      // disable the infinite scroll
      if (this.endOfResults === true) {
        event.target.disabled = true;
      }
    }, 1500);
  }

  // Called when top button is clicked -> returns to search page
  onBackClick() {
    this.navCtrl.navigateBack(['/', 'search']);
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

  // Returns an array of type YearsData containing information about
  // the number of papers for each year sorted by ascending year number
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
          'https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png'
        )
      );
    }
  }
}
