'use strict';

(function(){

function isOwner(){
  try{ return localStorage.getItem('piramid_role') === 'owner'; }catch(e){ return false; }
}

function esc(s){
  var d = document.createElement('div');
  d.textContent = String(s == null ? '' : s);
  return d.innerHTML;
}

function render(){
  var wrap = document.getElementById('storiesWrap');
  if(!wrap || !window.PiramidStories) return;

  var list = window.PiramidStories.all();
  var owner = isOwner();
  wrap.innerHTML = '';

  list.forEach(function(st){
    var el = document.createElement('div');
    el.className = 'story';
    el.setAttribute('data-id', st.id);
    el.setAttribute('data-name', st.name);
    el.setAttribute('data-rank', st.rank);
    el.setAttribute('data-initial', st.initial || (st.name || '؟').charAt(0));
    el.setAttribute('data-text', st.text);
    el.innerHTML =
      '<div class="story-ring"><div class="story-avatar">' + esc(st.initial || (st.name||'؟').charAt(0)) + '</div></div>' +
      '<div class="story-name">' + esc(st.name) + '</div>';
    wrap.appendChild(el);
  });

  if(owner){
    var add = document.createElement('div');
    add.className = 'story story-add';
    add.id = 'storyAddBtn';
    add.innerHTML =
      '<div class="story-ring story-ring-add"><div class="story-avatar story-avatar-add">+</div></div>' +
      '<div class="story-name">افزودن</div>';
    add.addEventListener('click', function(e){
      e.stopPropagation();
      if(window.PiramidStoriesAdmin) window.PiramidStoriesAdmin.openForm(null);
    });
    wrap.appendChild(add);
  }
}

window.PiramidStoriesUI = { render: render };

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(render, 120); });
} else {
  setTimeout(render, 120);
}

console.log('%c🏆 Stories render ready', 'color:#e85d9e;font-weight:700;');

})();