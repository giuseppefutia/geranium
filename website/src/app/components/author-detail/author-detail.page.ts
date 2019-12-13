import {
  Component,
  OnInit,
  NgZone,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';

import { ModelService } from '../../model/model.service';
import { ResultsService } from '../../services/results.service';
import { ExpandedAuthor, Author } from '../../model/author.model';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { ActivatedRoute } from '@angular/router';
import { Topic } from '../../model/topic.model';
import { SimplifiedPaper } from '../../model/paper.model';

am4core.useTheme(am4themes_animated);

interface HeatMapData {
  topicUrl: string;
  topic: string;
  year: string;
  papers: number;
}

class StyledTopic {
  topic: Topic;
  selected: boolean;

  constructor(topic: Topic, selected: boolean) {
    this.topic = topic;
    this.selected = selected;
  }
}

@Component({
  selector: 'app-author-detail',
  templateUrl: './author-detail.page.html',
  styleUrls: ['./author-detail.page.scss']
})
export class AuthorDetailPage implements OnInit, OnDestroy, AfterViewInit {
  // Input defined in authors.page.ts
  selectedAuthor: ExpandedAuthor; // This is read by the HTML page
  isLoading = false;
  private topicsList: Array<StyledTopic>;
  public suggestedTopicsList: Array<Topic>;
  public suggestedAuthorsList: Array<Author>;
  private filteredPapers: Array<SimplifiedPaper>;
  private chart: am4charts.XYChart;
  private topicsInHeatMap = 4;

  constructor(
    private resultsService: ResultsService,
    private dataModel: ModelService,
    private navCtrl: NavController,
    private zone: NgZone,
    private route: ActivatedRoute,
    private alertCtrl: AlertController
  ) {
    this.isLoading = true;
    this.topicsList = [];
    this.suggestedTopicsList = [];
    this.suggestedAuthorsList = [];
  }

  slidesOptions = {
    zoom: false,
    slidesPerView: 10,
    grabCursor: true,
    spaceBetween: 10,
    centeredSlides: false,
    breakpoints: {
      550: {
        slidesPerView: 2
      },
      768: {
        slidesPerView: 4
      },
      1200: {
        slidesPerView: 6
      }
    }
  };

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('authorID')) {
        if (this.dataModel.getSearchStackLength() === 0) {
          // TODO: Show autyhor without topic filters
          this.navCtrl.navigateRoot([
            '/',
            'results',
            'tabs',
            'papers',
            'Carbon'
          ]);
        } else {
          this.resultsService
            .getAuthorFromIDandTopic(
              paramMap.get('authorID'),
              this.dataModel.searchTopic.label
            )
            .subscribe(author => {
              this.selectedAuthor = this.dataModel.getAuthorDetails();
              this.makeDataUseful();
              this.isLoading = false;
              this.updateHeatMap();
            });
        }
      } else {
        this.navCtrl.navigateRoot(['/', 'search']);
      }
    });
  }

  ngAfterViewInit() {
    this.createGraph();
  }

  ngOnDestroy() {
    this.destroyGraph();
  }

  private makeDataUseful() {
    for (const paper of this.selectedAuthor.papers) {
      for (const topic_ of paper.topics) {
        if (
          this.topicsList.find(t => t.topic.url === topic_.url) === undefined
        ) {
          this.topicsList.push(new StyledTopic(topic_, false));
        }
      }
    }
    const mainTopicIndex = this.topicsList.findIndex(
      t => t.topic.label === this.dataModel.searchTopic.label
    );
    const mainTopic = this.topicsList.splice(mainTopicIndex, 1)[0];
    mainTopic.selected = true;
    this.topicsList.splice(0, 0, mainTopic);
    this.filteredPapers = [...this.selectedAuthor.papers];
    this.selectedAuthor.papers.forEach(paper => {
      for (const topic of paper.suggestedTopics) {
        if (this.suggestedTopicsList.find(t => t.url === topic.url) === undefined) {
          this.suggestedTopicsList.push(topic);
        }
      }
    });
    this.selectedAuthor.papers.forEach(paper => {
      for (const author of paper.suggestedCoAuthors) {
        if (this.suggestedAuthorsList.find(a => a.id === author.id) === undefined) {
          this.suggestedAuthorsList.push(author);
        }
      }
      for (const author of paper.suggestedAuthors) {
        if (this.suggestedAuthorsList.find(a => a.id === author.id) === undefined) {
          this.suggestedAuthorsList.push(author);
        }
      }
    });
    console.log(this.suggestedAuthorsList);
  }

  onTopicChipClick(topicUrl: string) {
    const clickedTopic: StyledTopic = this.topicsList.find(
      t => t.topic.url === topicUrl
    );

    // Valid if coming from a topic search
    clickedTopic.selected = !clickedTopic.selected;

    this.filterPapers();
  }

  // The papers array in dataModel is filtered by the value of allPapersYears[i].shown
  // corresponding to each year. The result is stored in filteredPapers
  filterPapers() {
    let toBePushed;
    if (this.filteredPapers.length === 0) {
      toBePushed = this.selectedAuthor.papers.filter(
        paper =>
          paper.topics.find(
            paperTopic =>
              this.topicsList.find(t => t.topic.url === paperTopic.url)
                .selected === true
          ) !== undefined
      );

      this.filteredPapers = toBePushed;
    } else {
      // Filtering
      this.filteredPapers = this.filteredPapers.filter(
        paper =>
          paper.topics.find(
            paperTopic =>
              this.topicsList.find(t => t.topic.url === paperTopic.url)
                .selected === true
          ) !== undefined
      );

      const allPapers = this.selectedAuthor.papers.filter(
        paper =>
          paper.topics.find(
            paperTopic =>
              this.topicsList.find(t => t.topic.url === paperTopic.url)
                .selected === true
          ) !== undefined
      );

      // Merging (where the magic happens)
      this.dataModel.mergeArraysRightPriority(this.filteredPapers, allPapers);
    }
  }

  private createGraph() {
    this.zone.runOutsideAngular(() => {
      const chart = am4core.create('topicmapdiv', am4charts.XYChart);
      chart.maskBullets = false;

      const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      const yAxis = chart.yAxes.push(new am4charts.CategoryAxis());

      yAxis.dataFields.category = 'topic';
      xAxis.renderer.minGridDistance = 40;
      xAxis.dataFields.category = 'year';

      xAxis.renderer.grid.template.disabled = true;
      yAxis.renderer.grid.template.disabled = true;
      xAxis.renderer.axisFills.template.disabled = true;
      yAxis.renderer.axisFills.template.disabled = true;
      yAxis.renderer.ticks.template.disabled = true;
      xAxis.renderer.ticks.template.disabled = true;

      yAxis.renderer.inversed = true;

      const series_ = chart.series.push(new am4charts.ColumnSeries());
      series_.dataFields.categoryY = 'topic';
      series_.dataFields.categoryX = 'year';
      series_.dataFields.value = 'papers';
      series_.columns.template.disabled = true;
      series_.sequencedInterpolation = true;
      // series.defaultState.transitionDuration = 3000;

      const bullet = series_.bullets.push(new am4core.Circle());
      bullet.fill = am4core.color('rgba(49, 113, 224, 0.7)');
      bullet.tooltipText = '{topic}, {year}: {papers} papers';
      bullet.strokeWidth = 3;
      bullet.stroke = am4core.color('#ffffff');
      bullet.strokeOpacity = 0;

      bullet.adapter.add('tooltipY', (tooltipY, target) => {
        return -target.radius + 1;
      });

      series_.heatRules.push({
        property: 'radius',
        target: bullet,
        min: 10,
        max: 30
      });

      bullet.hiddenState.properties.scale = 0.01;
      bullet.hiddenState.properties.opacity = 1;

      const hoverState = bullet.states.create('hover');
      hoverState.properties.strokeOpacity = 1;
      chart.paddingRight = 20;

      this.chart = chart;
    });
  }

  private destroyGraph() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  private updateHeatMap() {
    if (this.chart) {
      const data: HeatMapData[] = [];
      let found: boolean;
      for (const paper of this.selectedAuthor.papers) {
        const date: string =
          paper.submittedDate.getFullYear().toString() === 'NaN'
            ? 'No Date'
            : paper.submittedDate.getFullYear().toString();
        for (const topic of paper.topics) {
          found = false;
          for (const dataPoint of data) {
            if (dataPoint.year === date && dataPoint.topicUrl === topic.url) {
              dataPoint.papers++;
              found = true;
              continue;
            }
          }
          if (!found) {
            data.push({
              topic: topic.label,
              topicUrl: topic.url,
              papers: 1,
              year: date
            });
          }
        }
      }
      data.sort((a, b) => {
        return b.papers - a.papers;
      });

      this.zone.runOutsideAngular(() => {
        this.chart.data = data.splice(0, this.topicsInHeatMap);
      });
    }
  }

  onAuthorThumbsDown(authorName: string) {
    const alert = this.alertCtrl
      .create({
        header: 'Prediction Feedback',
        message:
          'Are you sure you want to dislike the suggestion for <strong>' +
          authorName +
          '</strong>?<br/>This feedback will count in future predictions',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Canceled');
            }
          },
          {
            text: 'Yes',
            handler: () => {
              console.log('Sent');
            }
          }
        ]
      })
      .then(alertEl => {
        alertEl.present().then();
      });
  }

  onBackClick() {
    this.navCtrl.back();
  }

  onSuggestedTopicClick(topicLabel: string) {
    this.navCtrl.navigateForward([
      '/',
      'results',
      'tabs',
      'authors',
      topicLabel
    ]);
  }

  onPaperDetails(paperId: string) {
    this.navCtrl.navigateRoot(['/', 'results', 'paper', paperId]);
  }

  onCloseClick() {
    this.navCtrl.navigateBack([
      '/',
      'results',
      'tabs',
      'authors',
      this.dataModel.searchTopic.label
    ]);
  }
}
