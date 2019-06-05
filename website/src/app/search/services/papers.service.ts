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

  papers: Paper[] = [];
  simplifiedPapers = [
    new SimplifiedPaper(
      'PP1',  // Cambiare slash con trattino
      'Carbon Nanotubes as an Effective Opportunity for Cancer Diagnosis and Treatment',
      [
        new SimplifiedAuthor('123', 'Alessandro Sanginario'),
        new SimplifiedAuthor('782', 'Beatrice Miccoli'),
        new SimplifiedAuthor('900', 'Danilo Demarchi')
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
        new SimplifiedAuthor('Afr', 'Mauro Giorcelli'),
        new SimplifiedAuthor('BRB', 'Patrizia Savi'),
        new SimplifiedAuthor('900', 'Alberto Tagliaferro')
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
        new SimplifiedAuthor('123', 'Ezio Santagata'),
        new SimplifiedAuthor('Afr', 'Giuseppe Chiappinelli'),
        new SimplifiedAuthor('BRB', 'Orazio Ballieri'),
        new SimplifiedAuthor('900', 'Lucia Tsantilis')
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
        new SimplifiedAuthor('123', 'Aamer Abbas Khan'),
        new SimplifiedAuthor('123', 'Massimo Rovere'),
        new SimplifiedAuthor('123', 'Patrizia Savi'),
        new SimplifiedAuthor('782', 'Carlo Rosso')
      ],
      [
        'Graphene',
        'Epoxy',
        'Composite Material',
        'Carbon Nanotube',
        'Carbon Biochar',
        'Activated Carbon'
      ],
      new Date(2017, 11, 25),
      'https://upload.wikimedia.org/wikipedia/commons/9/9e/Graphen.jpg'
    ),
    new SimplifiedPaper(
      'PP5',
      'BaTiO3 nanotube arrays by hydrothermal conversion of TiO2 nanotube carpets grown by anodic oxidation',
      [
        new SimplifiedAuthor('123', 'Andrea Laberti'),
        new SimplifiedAuthor('900', 'Elisa Paola Ambrosio'),
        new SimplifiedAuthor('123', 'Diego Giovanni Manfredi'),
        new SimplifiedAuthor('900', 'Giancarlo Canavese'),
        new SimplifiedAuthor('782', 'Mariangela Lombardi'),
        new SimplifiedAuthor('BRB', 'Marzia Quaglio'),
        new SimplifiedAuthor('BRB', 'Federico Bella'),
        new SimplifiedAuthor('BRB', 'Nadia Garino'),
        new SimplifiedAuthor('123', 'Stefano Bianco'),
        new SimplifiedAuthor('782', 'Candido Pirri'),
        new SimplifiedAuthor('123', 'Stefano Stassi'),
        new SimplifiedAuthor('Afr', 'Angelica Chiodoni')
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
        new SimplifiedAuthor('Afr', 'Stefania Specchia'),
        new SimplifiedAuthor('BRB', 'Carlotta Francia')
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
  ) {
    for (const paper of this.simplifiedPapers) {
      this.papers.push(
        new Paper(
          paper.id,
          paper.title,
          'This is an example of paper abstract on whatever topic it is',
          paper.authors,
          paper.topics,
          paper.publicationDate,
          paper.imageUrl
        )
      );
    }
  }

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
    return this.papers.find(p => p.id === id);
  }

  fetchPapers(query: string) {
    // Guarda sul cellulare per foto di descrizione di come sara` popolato il JSON e su come strutturare richiesta
    // In linea di massima GET request con campi: > type= che rappresenta il tipo di richiesta a seconda della tab dalla quale e` effettuata
    //                                            > query= query sparql codificata in URI
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
