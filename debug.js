module.exports = {
  log: function(message) {
    debug(message);
  },
  logFolderNames: function(folderNames) {
    debug('Folder Names:', folderNames);
  },
  logDirectoryPath: function(directoryPath) {
    debug('Directory Path:', directoryPath);
  },
  logHtml: function(title, homeUrl, iconSrc) {
    debug('HTML:', { title, homeUrl, iconSrc });
  },
  logHtmltwo: function(title, content, homeUrl, iconSrc) {
    debug('HTML:', { title, content, homeUrl, iconSrc });
  },
  logHtmltree: function(title, content, homeUrl, iconSrc, subfolderName) {
    debug('HTML:', { title, content, homeUrl, iconSrc, subfolderName });
  },
  logServerPort: function(PORT) {
    debug('PORT:', {PORT});
  },
  start: function() {
    debug('Start');
  }
};