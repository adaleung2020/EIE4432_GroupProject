$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('eventId');

  //JSON.parse(localStorage.getItem('bookedSeat')) ||

  var bookingStatus = [];
  var selectedseat = null;
  var totalprice = 0;

  fetch(`/auth/event/${eventId}`, {
    method: 'Get',
  })
    .then(function (response) {
      return response.json();
    })
    .then((eventDetail) => {
      const eventName = eventDetail.name;
      const eventDate = eventDetail.date;
      const eventTime = eventDetail.time;
      const eventDescription = eventDetail.description;
      const eventVenue = eventDetail.venue;

      $('#eventName').text(eventName);
      $('#eventDate').text(eventDate);
      $('#eventTime').text(eventTime);
      $('#eventDescription').text(eventDescription);
      $('#eventVenue').text(eventVenue);

      if (!eventDetail.selectedseat) {
        bookingStatus = [];
      } else {
        bookingStatus = eventDetail.selectedseat.split(',').map((seat) => seat.trim());

        bookingStatus.forEach((bookedseat) => {
          $('#' + bookedseat).addClass('booked');
        });
      }
    })
    .catch(function (error) {
      console.log('Request failed', error);
    });

  function selectedlist(seatId) {
    $('#selectedseat').append(seatId + ',');
    bookingStatus.push(seatId);
    alert(bookingStatus[1]);
  }

  function calculPrice(value) {
    var price = parseInt(value, 10);
    totalprice += price;
    $('#price').html('Price:' + totalprice);
  }

  $('rect').click(function () {
    var seatId = $(this).attr('id');
    var value = $(this).attr('value');
    if (bookingStatus.includes(seatId)) {
      alert('This seat is already booked.');
    } else {
      selectedseat = seatId;
      selectedlist(seatId);
      calculPrice(value);
      // localStorage.setItem('bookedSeat', JSON.stringify(bookingStatus));
      $('#' + selectedseat).addClass('booked');
    }
  });

  $('#checkout').click(function () {
    var total = totalprice + 20;
    $('#payment').show();
    $('.price').text(totalprice);
    $('.total').text(total);
  });

  $('#checkout').click(function () {
    selectedseatTodb(eventId, bookingStatus);
  });

  function selectedseatTodb(eventId, bookingStatus) {
    const formData = new FormData();
    formData.append('eventId', eventId);
    formData.append('bookingStatus', bookingStatus);
    console.log(bookingStatus);

    fetch('/auth/selectedSeat', {
      method: 'POST',
      body: formData,
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        if (result.status == 'success') {
          console.log('selected success');
        } else if (result.status == 'failed') {
          console.log('selected fail');
        }
      })

      .catch(function (error) {
        console.log('Request failed', error);
      });
  }

  $('#Makepayment').click(function () {});
});
