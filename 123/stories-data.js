'use strict';

(function(){

var KEY = 'piramid_stories';

var DEFAULTS = [
  { id: 'st_1', name: 'محمد رضایی', rank: 'رتبه ۴۵۰ تجربی', initial: 'م', text: 'تخمین تراز پیرامید تقریبا با کارنامه‌ی نهایی من یکسان بود.', order: 1 },
  { id: 'st_2', name: 'زهرا احمدی', rank: 'رتبه ۱۲۰۰ انسانی', initial: 'ز', text: 'گزارش تراز سوابق خیلی شفاف بود.', order: 2 },
  { id: 'st_3', name: 'علی محمدی', rank: 'رتبه ۸۹۰ ریاضی', initial: 'ع', text: 'ماژول انتخاب رشته دقیقا دانشگاه‌های قابل قبول را نشان داد.', order: 3 },
  { id: 'st_4', name: 'سارا کریمی', rank: 'رتبه ۳۲۰ تجربی', initial: 'س', text: 'تحلیل نقاط ضعف خیلی کمکم کرد.', order: 4 }
];

function read(){
  try{
    var raw = localStorage.getItem(KEY);
    if(!raw){
      localStorage.setItem(KEY, JSON.stringify(DEFAULTS));
      return DEFAULTS.slice();
    }
    var list = JSON.parse(raw);
    if(!Array.isArray(list)) return DEFAULTS.slice();
    return list.slice().sort(function(a,b){ return (a.order||0) - (b.order||0); });
  }catch(e){ return DEFAULTS.slice(); }
}

function write(list){
  try{
    var sorted = list.slice().sort(function(a,b){ return (a.order||0) - (b.order||0); });
    localStorage.setItem(KEY, JSON.stringify(sorted));
  }catch(e){}
}

function genId(){
  return 'st_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
}

window.PiramidStories = {
  all: read,
  add: function(data){
    var list = read();
    var maxOrder = list.reduce(function(m, s){ return Math.max(m, s.order||0); }, 0);
    var item = {
      id: genId(),
      name: data.name || '',
      rank: data.rank || '',
      initial: data.initial || (data.name || '؟').charAt(0),
      text: data.text || '',
      order: data.order || (maxOrder + 1)
    };
    list.push(item);
    write(list);
    return item;
  },
  update: function(id, data){
    var list = read();
    for(var i = 0; i < list.length; i++){
      if(list[i].id === id){
        if(data.name !== undefined) list[i].name = data.name;
        if(data.rank !== undefined) list[i].rank = data.rank;
        if(data.initial !== undefined) list[i].initial = data.initial;
        if(data.text !== undefined) list[i].text = data.text;
        if(data.order !== undefined) list[i].order = data.order;
        break;
      }
    }
    write(list);
  },
  remove: function(id){
    write(read().filter(function(s){ return s.id !== id; }));
  },
  get: function(id){
    var list = read();
    for(var i = 0; i < list.length; i++) if(list[i].id === id) return list[i];
    return null;
  },
  move: function(id, dir){
    var list = read();
    var idx = -1;
    for(var i = 0; i < list.length; i++) if(list[i].id === id){ idx = i; break; }
    if(idx === -1) return false;
    var target = idx + dir;
    if(target < 0 || target >= list.length) return false;
    var temp = list[idx];
    list[idx] = list[target];
    list[target] = temp;
    for(var j = 0; j < list.length; j++) list[j].order = j + 1;
    write(list);
    return true;
  },
  reset: function(){ write(DEFAULTS.slice()); }
};

console.log('%c🏆 Stories data ready', 'color:#e85d9e;font-weight:700;');

})();