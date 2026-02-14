const path = require('path');
const { registerTovianShortcodes } = require('./eleventy/tovianShortcodes');

module.exports = function(eleventyConfig) {
  registerTovianShortcodes(eleventyConfig, {
    csvPath: path.join(__dirname, 'template_replacements.csv'),
  });

  // Passthrough: site-level static assets
  eleventyConfig.addPassthroughCopy({ 'site/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ 'site/images': 'images' });
  eleventyConfig.addPassthroughCopy({ 'site/fonts': 'fonts' });
  eleventyConfig.addPassthroughCopy({ 'site/app.js': 'app.js' });
  eleventyConfig.addPassthroughCopy({ 'site/examples.js': 'examples.js' });
  eleventyConfig.addPassthroughCopy({ 'site/CsvToTable.js': 'CsvToTable.js' });
  eleventyConfig.addPassthroughCopy({ 'site/styles.css': 'styles.css' });
  eleventyConfig.addPassthroughCopy({ 'site/dictionary.csv': 'dictionary.csv' });
  eleventyConfig.addPassthroughCopy({ 'site/ipa_map.csv': 'ipa_map.csv' });
  eleventyConfig.addPassthroughCopy({ 'site/parallels.csv': 'parallels.csv' });
  eleventyConfig.addPassthroughCopy({ 'site/examples.csv': 'examples.csv' });
  eleventyConfig.addPassthroughCopy({ 'site/template_replacements.csv': 'template_replacements.csv' });
  eleventyConfig.addPassthroughCopy({ 'site/unimorph_en_verbs.json': 'unimorph_en_verbs.json' });
  // Tools
  eleventyConfig.addPassthroughCopy({ 'site/gloss/gloss.js': 'gloss/gloss.js' });
  // Only copy specific guide assets; templates in site/guide are rendered
  eleventyConfig.addPassthroughCopy({ 'site/guide/guide.js': 'guide/guide.js' });
  eleventyConfig.addPassthroughCopy({ 'site/guide/guide.pdf': 'guide/guide.pdf' });
  eleventyConfig.addPassthroughCopy({ 'site/guide.pdf': 'guide.pdf' });

  return {
    dir: {
      input: 'site',
      output: 'docs',
      includes: '_includes'
    },
    templateFormats: [
      'njk', 'md', 'html'
    ],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    pathPrefix: '/tovian/'
  };
};
