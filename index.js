'use strict';

const Hapi = require('@hapi/hapi');
const ytdl = require('ytdl-core');
const H2o2 = require('@hapi/h2o2');

const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
});


server.route({
    method: 'GET',
    path: '/hd',
    handler: (request, h) => {

        const info = new Promise((res, rej) => {
            try {
                ytdl.getInfo('wLgUWR3Kgo8', (err, info) => {
                    if (err) throw err;
                    let audioFormats = ytdl.filterFormats(info.formats, 'videoonly');
                    res(audioFormats);
                });
            } catch (e) {
                rej(e);
            }
        })

        return info;

    }
});

const init = async () => {
    await server.register(H2o2);
    server.route({
        method: 'GET',
        path: '/',
        handler: {
            proxy: {
                uri: 'https://r2---sn-4g5ednly.googlevideo.com/videoplayback?expire=1582799555&ei=Y0ZXXvb-J5i21gLX9ImwBA&ip=80.240.31.227&id=o-AAF_nS1rX1HsCxBKyf50g2vCW2_wAtanMXRrjJuUc_UO&itag=248&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C271%2C278%2C313&source=youtube&requiressl=yes&mm=31%2C29&mn=sn-4g5ednly%2Csn-4g5e6nsy&ms=au%2Crdu&mv=m&mvi=1&pl=24&initcwndbps=701250&vprv=1&mime=video%2Fwebm&gir=yes&clen=607754925&dur=2098.207&lmt=1569772201514603&mt=1582777834&fvip=2&keepalive=yes&fexp=23842630&beids=9466587&c=WEB&txp=5531432&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cgir%2Cclen%2Cdur%2Clmt&sig=ALgxI2wwRAIgJf1V0TAn5sMXjqdK_uKkunHeN4A1PskJjn_mPuV3QesCIHwvvfNXbP4mm4qXWs65Cu6vpOgTyWm4EEial0QMDpbt&lsparams=mm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AHylml4wRAIgfMuHTIDslH1RkHLkCiu4eQUnoDcztpAZMahaJvr1sWsCIAXzxJeKV4RXO9cIg6ptDZz3T5Qki3W07IPFNdAydANi&ratebypass=yes'
            }
        }
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();