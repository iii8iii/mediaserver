'use strict';

const Hapi = require('@hapi/hapi');
const ytdl = require('ytdl-core');
const Ammo = require('@hapi/ammo');

const init = async () => {

    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: '0.0.0.0'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {

            // 从链接里获得请求参数
            // const url = 'https://www.youtube.com/watch?v=WhXefyLs-uw';
            const id = request.query.v;
            const requestRange = request.headers.range;
            try {
                // 请求视频内容
                const video = ytdl(id, { highWaterMark: 1 << 25 });
                // 返回视频流
                if (requestRange) {
                    const p = new Promise((res, rej) => {
                        try {
                            video.once('progress', (chunkLength, downloaded, total) => {
                                res(total);
                            })
                        } catch (e) {
                            rej('Opoos')
                        }
                    }).then(totalLength => {
                        let range = Ammo.header(requestRange, totalLength)[0]
                        console.log('range:', range)
                        const start = range.from;
                        const end = range.to;
                        const stream = new Ammo.Clip(range)
                        video.pipe(stream)
                        return h
                            .response(stream)
                            .code(206)
                            .header('Content-Range', 'bytes ' + start + '-' + end + '/' + totalLength)
                            .header('Content-Length', start == end ? 0 : (end - start + 1))
                            .header('Content-Type', 'video/mp4')
                            .header('Accept-Ranges', 'bytes')
                    }).catch(e => { return e; })

                    return p;
                } else {
                    return h
                        .response(video)
                        .header('Content-Type', 'video/mp4')
                }
            } catch (e) {
                return 'Opoos Something went wrong';
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/hd',
        handler: (request, h) => {

            // 从链接里获得请求参数
            // const url = 'https://www.youtube.com/watch?v=WhXefyLs-uw';
            const query = request.query;
            const id = query.a || query.v;
            const hdQuality = id === query.a ? "highestaudio" : "highestvideo";
            const ContentType = id == query.a ? 'audio/mp3' : 'video/mp4';
            const requestRange = request.headers.range;
            try {
                // 请求视频内容
                const media = ytdl(id, { highWaterMark: 1 << 25, quality: hdQuality });
                // 返回视频流
                if (requestRange) {
                    const p = new Promise((res, rej) => {
                        try {
                            media.once('progress', (chunkLength, downloaded, total) => {
                                res(total);
                            })
                        } catch (e) {
                            rej('Opoos')
                        }
                    }).then(totalLength => {
                        let range = Ammo.header(requestRange, totalLength)[0]
                        console.log('range:', range)
                        const start = range.from;
                        const end = range.to;
                        const stream = new Ammo.Clip(range)
                        media.pipe(stream)
                        return h
                            .response(stream)
                            .code(206)
                            .header('Content-Range', 'bytes ' + start + '-' + end + '/' + totalLength)
                            .header('Content-Length', start == end ? 0 : (end - start + 1))
                            .header('Content-Type', ContentType)
                            .header('Accept-Ranges', 'bytes')
                    }).catch(e => { return e; })

                    return p;
                } else {
                    return h
                        .response(media)
                        .header('Content-Type', ContentType)
                }
            } catch (e) {
                return 'Opoos Something went wrong';
            }
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();