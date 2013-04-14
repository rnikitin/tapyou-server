interface ISubscribeData
{
    name: string;
    channel: string;
}

interface ISocketMessage {
    from: string;
    when: Date;
    text: string;
}