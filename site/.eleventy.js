module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("*.csv");
  eleventyConfig.addPassthroughCopy("*.js");
  // Glosser/translator client script lives under gloss/
  eleventyConfig.addPassthroughCopy("gloss/gloss.js");
  // Guide client script lives under guide/
  eleventyConfig.addPassthroughCopy("guide/guide.js");
  eleventyConfig.addPassthroughCopy("*.css");
  eleventyConfig.addPassthroughCopy("*.pdf");

  // Watch CSS files
  eleventyConfig.addWatchTarget("**/*.css");

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
