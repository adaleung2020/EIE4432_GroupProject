$(document).ready(function () {
  var bookingStatus = [];

  $('#event').click(function () {
    $('#eventManagement').show();
    $('#seatManagement').hide();
  });

  $('#seat').click(function () {
    $('#eventManagement').hide();
    $('#seatManagement').show();
  });

  $('#upload').click(function () {
    const name = $('#name').val();
    const id = $('#id').val();
    const type = $('#type').val();
    const price = $('#price').val();
    const date = $('#date').val();
    const time = $('#time').val();
    const venue = $('#venue').val();
    const description = $('#description').val();
    // add(name, id, type, price, date, time, venue, description);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('id', id);
    formData.append('type', type);
    formData.append('price', price);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('venue', venue);
    formData.append('description', description);
    var profileImgInput = document.querySelector('input[name="img"]');
    if (profileImgInput.files.length > 0) {
      formData.append('profileImage', profileImgInput.files[0]);
    }

    fetch('/auth/addevent', {
      method: 'POST',
      body: formData,
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        if (result.status == 'success') {
          alert(`Added successfully`);
        } else if (result.status == 'failed') {
          alert('Fail to add');
        }
      })

      .catch(function (error) {
        console.log('Request failed', error);
      });
  });

  // function add(name, id, type, price, date, time, venue, description) {
  //   const formData = new FormData();
  //   formData.append('name', name);
  //   formData.append('id', id);
  //   formData.append('type', type);
  //   formData.append('price', price);
  //   formData.append('date', date);
  //   formData.append('time', time);
  //   formData.append('venue', venue);
  //   formData.append('description', description);
  //   var profileImgInput = document.querySelector('input[name="img"]');
  //   if (profileImgInput.files.length > 0) {
  //     formData.append('profileImage', profileImgInput.files[0]);
  //   }

  //   fetch('/auth/addevent', {
  //     method: 'POST',
  //     body: formData,
  //   })
  //     .then(function (response) {
  //       return response.json();
  //     })
  //     .then(function (result) {
  //       if (result.status == 'success') {
  //         alert(`Added successfully`);
  //       } else if (result.status == 'failed') {
  //         alert('Fail to add');
  //       }
  //     })

  //     .catch(function (error) {
  //       console.log('Request failed', error);
  //     });
  // }

  $('#search').click(function () {
    const eventId = $('#eventId').val();
    search(eventId);
  });

  function search(eventId) {
    fetch(`/auth/seatManagement/${eventId}`, {
      method: 'Get',
    })
      .then(function (response) {
        return response.json();
      })
      .then((eventDetail) => {
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
  }
});
