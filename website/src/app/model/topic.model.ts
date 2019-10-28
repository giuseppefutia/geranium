export class TopicNoImg {
    constructor(public url: string, public wikiUrl: string, public label: string) {}
}

export class Topic extends TopicNoImg {
    constructor(public url: string, public wikiUrl: string, public label: string, public img: string) {
        super(url, wikiUrl, label);
    }
}
