   const socket = new WebSocket('ws://10.0.0.30:3000');

            socket.onopen = () => {
                      console.log('Connected to WebSocket server');
            };

            socket.onmessage = function(event) {
                console.log('Received data:', event.data);
                if (event.data instanceof Blob) {
                event.data.text().then(function(text) {
                console.log('Blob text:', text);
                try {
                    const data = JSON.parse(text);                                  
                    displayMessage(data);
                } catch (e) {
                    console.error('Failed to parse JSON:', e);
                    console.error('Text content:', text);                
                }});
                } else {
                try {
                    const data = JSON.parse(event.data);
                    displayMessage(data);
                } catch (e) {
                    console.error('Failed to parse JSON:', e);
                    console.error('Raw data:', event.data);
                }}};

            function displayMessage(data) {
                try {                  
                    if (typeof data === 'object' && data !== null) {
                    if (data.PersonsInvolve !== undefined && data.IncidentType !== undefined && data.DateTime !== undefined && data.Location !== undefined) {
                    const audio = document.getElementById('notificationSound');
                    if (audio) {
                        audio.play();
                    }
                        const customHeader = '';
                        let imageHtml = '';
                    if (data.image) {
                      imageHtml = `<img src="data:image/png;base64,${data.image}" class="modal-image" alt="Attached Image" onclick="toggleExpand(event)">`;
                    }
                const formattedMessage = `
                  <p><strong>No. of Persons Involve:</strong> ${data.PersonsInvolve}<ion-icon name="accessibility"></ion-icon></p>
                  <p><strong>Incident Type:</strong> ${data.IncidentType}</p>
                  <p><strong>Date & Time:</strong> ${data.DateTime}</p>
                  <p><strong>Current Location:</strong> ${data.Location}</p>
                  ${imageHtml}
                `;

                console.log('Formatted Message:', formattedMessage);

            const modalBody = document.getElementById('modalBody');
            if (modalBody) {
                modalBody.innerHTML = customHeader + formattedMessage;
                const modal = new bootstrap.Modal(document.getElementById('messageModal'));
                modal.show();
            }
            } else {
                console.warn('Unexpected data format:', data);
            }
            } else {
                console.warn('Data is not an object:', data);
            }
            } catch (e) {
                console.error('Error handling message:', e);
                console.error('Received data:', data);
            }
            }

            document.getElementById('btn-function').addEventListener('click', function () {
                const responseMessage = 'Response is on the way';
                socket.send(responseMessage); // Send response message back to Flutter app
            });
           