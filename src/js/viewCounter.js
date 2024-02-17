const path = require('path');
const { Level } = require('level');
const fs = require('fs');

const excludedir = ["assets"];
let dirlist = fs.readdirSync(path.resolve("../counter/views")).filter(filter);

const db = new Level('vidViews', { valueEncoding: 'json' })
db.open();

module.exports = {
    sync: async (req, res) => {
        await addVidTodb();
        console.log("Sync Complete!", __dirname);
        return res.redirect('/videos/list');
    },
    list: async (req, res) => {
        let list = [];
        for await (const [key, value] of db.iterator({})) {
            list.push({ key, value });
        }
        res.render(path.resolve('../counter/list/index.ejs'), {list, totalViews:await calculateTotalViews()});
        console.log("/videos listed");
    },
    video: async (req, res) => {
        const { videoId } = req.params;
        let videoviews = await db.get(videoId).catch(err => {console.log(err); return; } );
        console.log(videoId, videoviews)
        if (videoviews !== undefined) {   
            videoviews += 1;    
            await db.put(videoId, videoviews); 
            console.log(`Video ${videoId} play count incremented. Total plays: ${videoviews}`);
            res.render(path.resolve(`../counter/views/${videoId}/index.ejs`), {viewCount: videoviews});
            console.log(`${videoId}`);
        } else {
            res.status(400).json({ success: false, error: 'Missing videoId in the request body' });
        }
    },
    index: function(req, res) {
        res.render(path.resolve('../counter/views/index.ejs'));
    }
};
