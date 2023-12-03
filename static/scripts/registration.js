$(document).ready(function () {
  $('#register').click(function () {
    const username = $('#username').val();
    const password = $('#password').val();
    const email = $('#email').val();
    const phone = $('#phone').val();
    const birth = $('#birth').val();
    const gender = $('.gender').val();
    const repeatpassword = $('#RepeatPassword').val();
    const role = 'users';

    if (!username || !password) {
      alert('Username and password cannot be empty');
    }

    if (password !== repeatpassword) {
      alert('Password mismatch!');
    }

    if (!email) {
      alert('Email cannot be empty');
    }

    if (!phone) {
      alert('Phone number cannot be empty');
    }

    if (!birth) {
      alert('Birth cannot be empty');
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('gender', gender);
    formData.append('birth', birth);
    formData.append('role', role);
    var profileImgInput = document.querySelector('input[name="img"]');
    if (profileImgInput.files.length > 0) {
      formData.append('profileImage', profileImgInput.files[0]);
    }
    fetch('/auth/register', {
      method: 'POST',
      body: formData,
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        if (result.status == 'success') {
          alert(`Welcome,${username}!` + `\n` + `You can login with your account now!`);
          window.location.href = 'http://127.0.0.1:8080/index.html';
        } else if (result.status == 'failed') {
          alert(result.message);
        } else {
          alert('Unknown error');
        }
      })
      .catch(function (error) {
        console.log('Request failed', error);
      });
  });
});
