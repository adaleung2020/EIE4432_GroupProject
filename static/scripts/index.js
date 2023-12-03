$(document).ready(function () {
  let logoutTimer;

  function startLogoutTimer() {
    // Clear the previous timer, if any
    clearTimeout(logoutTimer);

    // Set the logout duration (in milliseconds)
    const logoutDuration = 60000; // 5 minutes300000

    // Start the timer
    logoutTimer = setTimeout(function () {
      // Perform logout after the specified duration
      logout();
      alert('You have been automatically logged out due to inactivity.');
    }, logoutDuration);
  }

  function logout() {
    // Clear the logout timer
    clearTimeout(logoutTimer);
    localStorage.removeItem('isLoggedIn');
    $('.logsign').show();
    $('.logout').hide();
    // ... existing logout code ...
  }

  // Function to reset the logout timer on user activity
  function resetLogoutTimer() {
    // Clear the previous timer, if any
    clearTimeout(logoutTimer);

    // Start a new timer
    startLogoutTimer();
  }

  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const role = localStorage.getItem('role');
  if (role === 'users') {
    $('#users').show();
    $('#admin').hide();
  } else {
    $('#users').hide();
    $('#admin').show();
  }

  if (isLoggedIn === 'true') {
    // User is logged in
    $('.logsign').hide();
    $('.logout').show();

    startLogoutTimer();

    // startLogoutTimer();
  } else {
    // User is not logged in
    $('.logsign').show();
    $('.logout').hide();
  }

  $('#logout').click(function () {
    const confirmLogout = confirm('Confirm to logout?');
    if (confirmLogout) {
      fetch('/auth/logout', {
        method: 'POST',
      })
        .then(function (response) {
          if (response.status === 200) {
            $('.logsign').show();
            $('.logout').hide();
            localStorage.removeItem('isLoggedIn');
            // window.location.href = 'http://127.0.0.1:8080/login.html';
          } else {
            alert('Logout failed. Please try again.');
          }
        })
        .catch(function (error) {
          console.error('Logout request failed', error);
          alert('An error occurred during logout. Please try again.');
        });
    }
  });

  $('#logout').click(function () {
    // Clear login status
    localStorage.removeItem('isLoggedIn');
    // Toggle visibility of login and logout elements
    $('.logsign').show();
    $('.logout').hide();
  });
});
