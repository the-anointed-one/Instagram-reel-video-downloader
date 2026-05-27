const { extractVideoData } = require('./services/extractor');

async function test() {
  const urls = [
    { name: 'Instagram', url: 'https://www.instagram.com/reel/C8qLd7qR7E-/', platform: 'instagram' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@tiktok/video/7206130983654493483', platform: 'tiktok' },
    { name: 'Facebook', url: 'https://www.facebook.com/watch/?v=10156064049413553', platform: 'facebook' },
    { name: 'YouTube', url: 'https://www.youtube.com/shorts/5XmQ2h2c5uQ', platform: 'youtube' }
  ];

  for (const {name, url, platform} of urls) {
    try {
      console.log(`\nTesting ${name}...`);
      const data = await extractVideoData(url, platform);
      console.log(`✅ ${name} Success!`);
      console.log(`Title: ${data.title}`);
      console.log(`Video URL starts with: ${data.videoUrl.substring(0, 50)}...`);
    } catch (err) {
      console.error(`❌ ${name} Failed: ${err.message}`);
    }
  }
}
test();
