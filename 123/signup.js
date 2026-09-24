'use strict';

(function(){

var $ = function(s){ return document.querySelector(s); };

function encodeUser(u){
  var data = {
    n: u.username || '',
    d: u.displayName || '',
    e: u.email || '',
    a: u.age || '',
    g: u.gradient || 'g1'
  };
  var json = JSON.stringify(data);
  var b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

$('#signupForm').addEventListener('submit', function(e){
  e.preventDefault();

  var name = $('#suName').value.trim();
  var user = $('#suUser').value.trim().toLowerCase();
  var email = $('#suEmail').value.trim();
  var age = $('#suAge').value.trim();

  if(!name){ window.showToast && window.showToast('نام رو وارد کن', 'error'); return; }
  if(!/^[a-z0-9_]{3,20}$/.test(user)){
    window.showToast && window.showToast('نام کاربری معتبر نیست (حروف انگلیسی، عدد، _ )', 'error');
    return;
  }

  var profile = {
    username: user,
    displayName: name,
    email: email,
    age: age,
    gradient: 'g1',
    createdAt: Date.now()
  };

  try{ localStorage.setItem('piramid_user_profile', JSON.stringify(profile)); }catch(e){}

  var code = encodeUser(profile);
  $('#userCode').value = code;
  $('#signupCard').style.display = 'none';
  $('#codeCard').style.display = 'block';
  window.showToast && window.showToast('پروفایل ساخته شد', 'success');
});

$('#copyCode').addEventListener('click', function(){
  var ta = $('#userCode');
  ta.select();
  ta.setSelectionRange(0, 99999);
  try{
    document.execCommand('copy');
    window.showToast && window.showToast('کپی شد', 'success');
  }catch(e){
    navigator.clipboard && navigator.clipboard.writeText(ta.value).then(function(){
      window.showToast && window.showToast('کپی شد', 'success');
    });
  }
});

})();