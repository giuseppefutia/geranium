export class TopicNoImg {
    constructor(public url: string, public label: string) {}
}

export class Topic extends TopicNoImg {
    constructor(public url: string, public label: string, public img: string) {
        super(url, label);
    }
}
