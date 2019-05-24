import { Injectable } from '@angular/core';
import { Paper } from '../models/paper.model';
import { Author } from '../models/author.model';
import { SimplifiedPaper } from '../models/simplified-paper.model';
import { SimplifiedAuthor } from '../models/simplified-author.model';
import { HttpClient } from '@angular/common/http';
import { AuthorsService } from './authors.service';

/*papers = [
    new Paper(
      'abc',
      "This is the title of a very long and complex paper and I don't want to break anything but I think that if the title is too long the card will be excessively tall",
      'This is the abstract: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      [new Author('123', 'J.K. Rowling'), new Author('782', 'D. Eggers')],
      new Date(2019, 1, 19)
    ),
    new Paper(
      'cba',
      'Very short indeed',
      'This is the abstract and it is very very long: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      [new Author('123', 'J.K. Rowling'), new Author('782', 'D. Eggers')],
      new Date(2019, 1, 18)
    ),
    new Paper(
      '111',
      'Another paper about Artificial Intelligence',
      "This is a concise abstract, let's see how the card view will behave",
      [new Author('123', 'J.K. Rowling'), new Author('782', 'D. Eggers'), new Author('900', 'P. Mussorgsky')],
      new Date(2019, 1, 17)
    ),
    new Paper(
      'ABC',
      'Paper11',
      'This is the abstract: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      [new Author('123', 'J.K. Rowling'), new Author('782', 'D. Eggers')],
      new Date(2019, 1, 16)
    ),
    new Paper(
      'CBA',
      'Paper22',
      'This is the abstract and it is very very long: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      [new Author('123', 'J.K. Rowling'), new Author('782', 'D. Eggers')],
      new Date(2019, 1, 15)
    ),
    new Paper(
      '222',
      'Paper33',
      "This is a concise abstract, let's see how the card view will behave",
      [new Author('123', 'J.K. Rowling'), new Author('782', 'D. Eggers'), new Author('900', 'P. Mussorgsky')],
      new Date(2019, 1, 14)
    )
  ]; */

@Injectable({
  providedIn: 'root'
})
export class PapersService {
  public searchKey = '';

  // TODO: Change when connecting to server
  // It represents the size of the chunks retrieved from the server (pagination)
  private _blockSize = 6;
  simplifiedPapers = [
    new SimplifiedPaper(
      'PP1',
      'Carbon Nanotubes as an Effective Opportunity for Cancer Diagnosis and Treatment',
      [
        new SimplifiedAuthor('fafa', 'Alessandro Sanginario'),
        new SimplifiedAuthor('bea', 'Beatrice Miccoli'),
        new SimplifiedAuthor('danda', 'Danilo Demarchi')
      ],
      [
        'Carbon nanotube',
        'Ablation',
        'Laser Ablation',
        'Metastasis',
        'Nanomaterials',
        'Nanomedicine',
        'Nanoparticle'
      ],
      new Date(2017, 2, 17),
      'https://upload.wikimedia.org/wikipedia/commons/7/76/Kohlenstoffnanoroehre_Animation.gif'
    ),
    new SimplifiedPaper(
      'PP2',
      'Wide Band Microwave Characterization of MWCNTS/Epoxy Composites',
      [
        new SimplifiedAuthor('MauGio', 'Mauro Giorcelli'),
        new SimplifiedAuthor('PatSav', 'Patrizia Savi'),
        new SimplifiedAuthor('AlbTag', 'Alberto Tagliaferro')
      ],
      [
        'Polymer',
        'Filler',
        'Epoxy',
        'Elastic modulus',
        'Conductive polymer',
        'Composite material'
      ],
      new Date(2015, 1, 10),
      'https://img.purch.com/w/660/aHR0cDovL3d3dy5saXZlc2NpZW5jZS5jb20vaW1hZ2VzL2kvMDAwLzA5Ni8xMTEvb3JpZ2luYWwvcG9seXBlcHRpZGUuanBn'
    ),
    new SimplifiedPaper(
      'PP3',
      'Effects of Nano-sized Additives on the High-Temperature Properties of Bituminous Binders: A Comparative Study',
      [
        new SimplifiedAuthor('aaaa', 'Ezio Santagata'),
        new SimplifiedAuthor('sssss', 'Giuseppe Chiappinelli'),
        new SimplifiedAuthor('ddsaf', 'Orazio Ballieri'),
        new SimplifiedAuthor('aadad', 'Lucia Tsantilis')
      ],
      [
        'Carbon Nanotube',
        'Chemical Vapor Deposition',
        'Creep',
        'Elastic modulus',
        'Thermal conductiviy',
        'Viscosity',
        "Young's modulus"
      ],
      new Date(2016, 1, 8),
      'https://news.mit.edu/sites/mit.edu.newsoffice/files/styles/news_article_image_top_slideshow/public/images/2015/MIT-CVD-explained-1.jpg'
    ),
    new SimplifiedPaper(
      'PP4',
      'Low-Cost Carbon Fillers to Improve Mechanical Properties and Conductivity of Epoxy Composites',
      [
        new SimplifiedAuthor('0011', 'Aamer Abbas Khan'),
        new SimplifiedAuthor('adsahjk1', 'Massimo Rovere'),
        new SimplifiedAuthor('ada22', 'Patrizia Savi'),
        new SimplifiedAuthor('adsahjk1', 'Carlo Rosso')
      ],
      ['Graphene', 'Epoxy', 'Composite Material', 'Carbon Nanotube', 'Carbon Biochar', 'Activated Carbon'],
      new Date(2017, 11, 25),
      'https://upload.wikimedia.org/wikipedia/commons/9/9e/Graphen.jpg'
    ),
    new SimplifiedPaper(
      'PP5',
      'BaTiO3 nanotube arrays by hydrothermal conversion of TiO2 nanotube carpets grown by anodic oxidation',
      [
        new SimplifiedAuthor('LucLav', 'Andrea Laberti'),
        new SimplifiedAuthor('MatPav', 'Elisa Paola Ambrosio'),
        new SimplifiedAuthor('111', 'Diego Giovanni Manfredi'),
        new SimplifiedAuthor('222', 'Giancarlo Canavese'),
        new SimplifiedAuthor('33', 'Mariangela Lombardi'),
        new SimplifiedAuthor('122', 'Marzia Quaglio'),
        new SimplifiedAuthor('131', 'Federico Bella'),
        new SimplifiedAuthor('1414', 'Nadia Garino'),
        new SimplifiedAuthor('fds', 'Stefano Bianco'),
        new SimplifiedAuthor('tre', 'Candido Pirri'),
        new SimplifiedAuthor('ry9w', 'Stefano Stassi'),
        new SimplifiedAuthor('pdada', 'Angelica Chiodoni')
      ],
      [
        'Carbon nanotube',
        'Barium Titanate',
        'Nanoparticle',
        'Nanowire',
        'Oxide',
        'Sol-gel',
        'Titanium dioxide'
      ],
      new Date(2017, 11, 21),
      'http://www.chemtube3d.com/images/aleximages/batio3.png'
    ),
    new SimplifiedPaper(
      'PP6',
      'Mesoporous carbons supported non-noble metal Fe-NX electrocatalysts for PEM Fuel Cell oxygen reduction reaction',
      [
        new SimplifiedAuthor('123', 'Alessandro Hugo Monteverde Videla'),
        new SimplifiedAuthor('782', 'Juqin Zeng'),
        new SimplifiedAuthor('30111', 'Stefania Specchia'),
        new SimplifiedAuthor('dsja', 'Carlotta Francia')
      ],
      [
        'Carbon nanotube',
        'Carbon Monoxide',
        'Carbon',
        'Activated Carbon',
        'Cathode',
        'Nitrogen',
        'Mesoporous material'
      ],
      new Date(2016, 5, 3),
      'https://upload.wikimedia.org/wikipedia/commons/f/f0/Graphite-and-diamond-with-scale.jpg'
    ),
    new SimplifiedPaper(
      'CBA',
      'Paper22',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers')
      ],
      ['Deep Learning', 'AI', 'Education', 'Teaching', 'Psychology'],
      new Date(2015, 1, 10),
      'https://www.gardenandgreenhouse.net/wp-content/uploads/2014/07/Biochar.jpg'
    ),
    new SimplifiedPaper(
      '222',
      'Paper33',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers'),
        new SimplifiedAuthor('900', 'Modest Mussorgsky')
      ],
      ['Deep Learning', 'Knowledge Graphs'],
      new Date(2016, 1, 10),
      'https://www.azonano.com/images/Article_Images/ImageForArticle_4149(2).jpg'
    )
  ];

  constructor(
    private http: HttpClient,
    private authorsService: AuthorsService
  ) {}

  get blockSize(): number {
    return this._blockSize;
  }

  getSimplifiedPapersBlock(query: string, block: number): SimplifiedPaper[] {
    for (const paper of this.simplifiedPapers) {
      for (const author of paper.authors) {
        author.name = this.authorsService.simplifyAuthorName(author.name);
      }
    }
    return [...this.simplifiedPapers];
  }

  getPaperFromId(id: string): Paper {
    return new Paper(
      id,
      'Another paper about Artificial Intelligence',
      'This is the abstract: Keep close to Natures heart... and break clear away, \
    once in a while, and climb a mountain or spend a week in the woods. Wash your \
    spirit clean.',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers'),
        new SimplifiedAuthor('900', 'P. Mussorgsky')
      ],
      ['Deep Learning', 'AI'],
      new Date(2019, 1, 14),
      'https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png'
    );
  }

  fetchPapers(query: string) {
    const regex = / /g;
    const request = `PREFIX gpp:<http://geranium-project.org/publications/>
PREFIX gpk:<http://geranium-project.org/keywords/>
PREFIX purl:<http://purl.org/dc/terms/>
PREFIX dbp:<http://dbpedia.org/resource/>
select * where {
    ?publication purl:subject dbp:${query.replace(regex, '_')}
} limit 1000000`;
    this.http
      .get(
        'https://blazegraph.nexacenter.org/blazegraph/sparql?query=' +
          encodeURI('{}')
      )
      .subscribe(resData => {
        console.log(resData);
      });
  }
}
