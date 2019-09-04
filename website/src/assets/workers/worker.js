self.onmessage = function(e) {
  self.startFiltering(e.data);
};

self.startFiltering = function(data) {
  const temp = Array.from(data.allTopics);
  const r = new RegExp('\\b' + data.typed + '\\S*', 'gi');
  self.postMessage(temp.filter(s => s.label.search(r) !== -1));
};
