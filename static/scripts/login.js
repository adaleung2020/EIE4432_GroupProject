$(document).ready(function () {
  $('#login').click(function () {
    const username = $('#username').val();
    const password = $('#password').val();

    if (!username || !password) {
      alert('Username and password cannot be empty');
    } else {
      login(username, password);
    }
  });

  function login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    console.log(username);

    fetch('/auth/login', {
      method: 'POST',
      body: formData,
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        if (result.status == 'success') {
          alert(`Logged in as ${username}`);
          // startLogoutTimer();
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', result.user.username);
          localStorage.setItem('role', result.user.role);
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
  }

  $('#forgotPassword').click(function () {
    $('.login').hide();
    $('#Reset').show();
    $('#resetpassword').click(function () {
      const username = $('#Rusername').val();
      const password = $('#Rpassword').val();
      if (!username || !password) {
        alert('Username and password cannot be empty!');
      } else {
        resetPassword(username, password);
      }
    });
  });
  function resetPassword(username, newPassword) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('newPassword', newPassword);

    fetch('/auth/reset-password', {
      method: 'POST',
      body: formData,
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        if (result.status === 'success') {
          alert('Password reset successful. Please login with your new password.');
        } else {
          alert(result.message);
        }
      })
      .catch(function (error) {
        console.log('Request failed', error);
      });
  }

  // Check login status on page load
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    // User is logged in
    $('.logsign').hide();
    $('.logout').show();
  } else {
    // User is not logged in
    $('.logsign').show();
    $('.logout').hide();
  }

  const rememberedUsername = localStorage.getItem('username');
  if (rememberedUsername) {
    $('#username').val(rememberedUsername);
  }

  // Event listener for user activity (e.g., mousemove, keydown)
  // $(document).on('mousemove keydown', function () {
  //   resetLogoutTimer();
  // });

  $('#logout').click(function () {
    // Clear login status
    localStorage.removeItem('isLoggedIn');
    // Toggle visibility of login and logout elements
    $('.logsign').show();
    $('.logout').hide();
  });
});
