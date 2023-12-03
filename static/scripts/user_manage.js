$(document).ready(async function () {
  const logineduser = localStorage.getItem('username');

  await fetch(`/auth/userDetail/${logineduser}`, {
    method: 'Get',
  })
    .then(function (response) {
      return response.json();
    })
    .then((UserDetail) => {
      var cardHtml = `
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="card text-center">
                <h3 class="card-title text-center" >User Profile</h3>
                <img id="userImage" src="" alt="User Image" style="max-width:50%;">
                <h5 class="card-text">Nickname:${UserDetail.nickname}</h5>
                <p class="card-text">Username:${UserDetail.username}</p>
                <p class="card-text">Password:*********</p>
                <p class="card-text">Email:${UserDetail.email}</p>
                <button class="b1" id="edit">Edit</button>
            </div>
          </div>
        `;
      $('#userDetail').append(cardHtml);
      if (UserDetail.profileImage) {
        displayImg(UserDetail.profileImage);
      }
    })
    .catch(function (error) {
      console.log('Request failed', error);
    });

  function displayImg(base64Image) {
    const imgElement = document.getElementById('userImage');
    imgElement.src = 'data:image/jpeg;base64,' + base64Image;
  }
});

// <img src="/assets/${event.id}.jpg" class="card-img-top" alt="${event.name}">
