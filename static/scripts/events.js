$(document).ready(function () {
  $.get('assets/events.json', function (data) {
    console.log(data);
  }).fail(function (error) {
    console.error('Failed to fetch');
  });

  fetch(`/auth/displayevents`, {
    method: 'Get',
  })
    .then(function (response) {
      return response.json();
    })
    .then((allEvents) => {
      allEvents.forEach((event) => {
        var cardHtml = `
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="card">
              <img src="/assets/${event.id}.jpg" class="card-img-top" alt="${event.name}" id="userImage"> 
             
              <a href="/ticket_booking.html?eventId=${event.id}" style="text-decoration:none" class=" text-dark" >
              <div class="card-body" id="${event.id}">
                <h5 class="card-title text-center">${event.name}</h5>
                <p class="badge text-bg-secondary text-white">${event.type}</p>
                <p class="card-text">Price:${event.price}</p>
                <p class="card-text"><span>Date:${event.date}</span><span>Time:${event.time}</span></p>
                <p class="card-text">Venue:${event.venue}</p>
                <p class="card-text">Description:${event.description}</p>
              </div>
              </a>
            </div>
          </div>
        `;
        $('#events').append(cardHtml);
        if (allEvents.profileImage) {
          displayImg(allEvents.profileImage);
        }
      });
    })
    .catch(function (error) {
      console.log('Request failed', error);
    });

  function displayImg(base64Image) {
    const imgElement = document.getElementById('userImage');
    imgElement.src = 'data:image/jpeg;base64,' + base64Image;
  }
});
//  <img src="/assets/${event.id}.jpg" class="card-img-top" alt="${event.name}" id="userImage"></img>
