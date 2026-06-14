const path = require("path");
const { registerTovianShortcodes } = require("../eleventy/tovianShortcodes");

module.exports = function(eleventyConfig) {
  registerTovianShortcodes(eleventyConfig, {
    csvPath: path.join(__dirname, "template_replacements.csv"),
  });

  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("*.csv");
  eleventyConfig.addPassthroughCopy("*.js");
  eleventyConfig.addPassthroughCopy("*.json");
  // Glosser/translator client script lives under gloss/
  eleventyConfig.addPassthroughCopy("gloss/gloss.js");
  // Guide client script lives under guide/
  eleventyConfig.addPassthroughCopy("guide/guide.js");
  eleventyConfig.addPassthroughCopy("*.css");
  eleventyConfig.addPassthroughCopy("*.pdf");

  // Watch CSS files
  eleventyConfig.addWatchTarget("**/*.css");
  eleventyConfig.addWatchTarget("template_replacements.csv");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    pathPrefix: "/"
  };
};
