let map = null;
let markers = [];
let mapVisible = true;
const MAX_MARKERS = 5;


function initMap() {
    const centerLocation = { lat: 8.41625, lng: 123.82187 };
    map = new google.maps.Map(document.getElementById("maptrack"), {
        zoom: 15,
        center: centerLocation,
        mapTypeId: 'satellite',
        mapTypeControl: true
    });
}

function checkMapVisibility() {
    const mapElement = document.getElementById('maptrack');
    const rect = mapElement.getBoundingClientRect();
    mapVisible = rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
}

function createMarker(location, incident) {
    const customIconUrl = '/images/incidentLocation-removebg-preview.png';
    const iconSize = new google.maps.Size(50, 50);
    const labelFontSize = '30px';
    const labelFontOffset = new google.maps.Point(0, -100);

    const marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: {
            url: customIconUrl,
            scaledSize: iconSize,
            labelOrigin: new google.maps.Point(15, -20)
        },
        label: {
            text: 'Incident Location',
            color: 'white',
            fontSize: labelFontSize,
            fontWeight: 'bold'
        },
        title: 'Incident Location',
        incidentData: incident
    });

    marker.addListener('click', () => {
        const infoWindowContent = `
            <div>
                <p><strong>Sender Name:</strong> ${incident.fullname}</p>
                <p><strong>Incident Type:</strong> ${incident.IncidentType}</p>
                <p><strong>Location:</strong> ${incident.Location}</p>
                <p><strong>Date & Time:</strong> ${incident.DateTime}</p>
                <button id="removeMarkerBtn" class="btn btn-danger rounded-pill">remove marker</button>
            </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });
        infoWindow.open(map, marker);

        google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
            document.getElementById('removeMarkerBtn').addEventListener('click', () => {
                marker.setMap(null);
                markers = markers.filter(m => m !== marker);
                infoWindow.close();
            });
        });

        google.maps.event.addListenerOnce(map, 'click', () => {
            infoWindow.close();
        });
    });

    return marker;
}

function updateMapWithMarkers(newMarkers) {
    if (!map) {
        initMap();
    }

    newMarkers.forEach(marker => {
        markers.push(marker);
    });

    if (markers.length > MAX_MARKERS) {
        const excess = markers.length - MAX_MARKERS;
        markers.slice(0, excess).forEach(marker => marker.setMap(null));
        markers = markers.slice(excess);
    }

    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => bounds.extend(marker.getPosition()));
        map.fitBounds(bounds);
    }
}

const socket = new WebSocket('wss://server-coderied.onrender.com');

socket.onopen = () => {
    console.log('Connected to WebSocket server');
    const adminMessage = JSON.stringify({ type: 'admin' });
    socket.send(adminMessage);
};

socket.onmessage = function (event) {
    console.log('Received data:', event.data);
    if (event.data instanceof Blob) {
        event.data.text().then(function (text) {
            console.log('Blob text:', text);
            try {
                const data = JSON.parse(text);
                processReceivedData([data]);
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                console.error('Text content:', text);
            }
        });
    } else {
        try {
            const data = JSON.parse(event.data);
            processReceivedData([data]);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            console.error('Raw data:', event.data);
        }
    }
};

function processReceivedData(dataArray) {
    try {
        const newMarkers = [];
        const incidents = [];

        dataArray.forEach(data => {
            if (typeof data === 'object' && data !== null) {

                if (data.fullname !== undefined && data.PersonsInvolve !== undefined && data.IncidentType !== undefined && data.DateTime !== undefined && data.Location !== undefined) {
                    incidents.push(data);
                } else {
                    console.warn('Unexpected data format:', data);
                }
            } else {
                console.warn('Data is not an object:', data);
            }
        });

        updateMapWithMarkers(newMarkers);

        handleIncidents(incidents);
    } catch (e) {
        console.error('Error processing received data:', e);
    }
}

function handleIncidents(incidents) {
    incidents.forEach((incident, index) => {

        const audio = document.getElementById('notificationSound');
        if (audio) {
            audio.play();
        }

        let imageHtml = '';
        if (incident.image) {
            imageHtml = `<img src="data:image/png;base64,${incident.image}" class="modal-image" alt="Attached Image" onclick="toggleExpand(event)">`;
        }

        const formattedMessage = `
            <p><strong>Sender Name:</strong> ${incident.fullname}</p>
            <p><strong>No. of Persons Involved:</strong> ${incident.PersonsInvolve}</p>
            <p style="font-size: 30px"><strong>Incident Type:</strong> ${incident.IncidentType}</p>
            <p><strong>Date & Time:</strong> ${incident.DateTime}</p>
            <p><strong>Current Location:</strong> ${incident.Location}</p>
            ${imageHtml}
        `;

        const modalId = `messageModal-${Date.now()}-${index}`;

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" style="z-index: 1050;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${modalId}Label">Incident Report</h5>
                            <button type="button" class="btn-close" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${formattedMessage}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary rounded-pill" id="viewLocationBtn-${modalId}">View Location</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modalElement = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalElement, {
            keyboard: false,
            backdrop: 'static'
        });
        modal.show();

        document.getElementById(`viewLocationBtn-${modalId}`).addEventListener('click', () => {

            geocodeAddress(incident.Location, (location) => {
                if (location) {
                    map.setCenter(location);
                    map.setZoom(18);
                    stopAudio();

                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div>
                                <p><strong>Sender Name:</strong> ${incident.fullname}</p>
                                <p><strong>Incident Type:</strong> ${incident.IncidentType}</p>
                                <p><strong>Location:</strong> ${incident.Location}</p>
                                <p><strong>Date & Time:</strong> ${incident.DateTime}</p>
                            </div>
                        `
                    });
                    infoWindow.setPosition(location);
                    infoWindow.open(map);
                } else {
                    alert('Unable to geocode the incident location.');
                }
            });

            modal.hide();
        });

        const closeButton = modalElement.querySelector('.btn-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.hide();
            });
        }

        $(modalElement).find('.modal-dialog').draggable({
            handle: '.modal-header'
        });

        if (incident.latitude !== undefined && incident.longitude !== undefined) {
            const location = { lat: parseFloat(incident.latitude), lng: parseFloat(incident.longitude) };
            if (!isNaN(location.lat) && !isNaN(location.lng)) {
                const incidentMarker = createMarker(location, incident);
                updateMapWithMarkers([incidentMarker]);
            } else {
                console.error('Invalid incident latitude or longitude:', incident.latitude, incident.longitude);
            }
        } else {
            geocodeAddress(incident.Location, (location) => {
                if (location) {
                    const incidentMarker = createMarker(location, incident);
                    updateMapWithMarkers([incidentMarker]);
                } else {
                    console.error('Unable to geocode incident location:', incident.Location);
                }
            });
        }
    });
}

function geocodeAddress(address, callback) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            callback({ lat: location.lat(), lng: location.lng() });
        } else {
            console.error('Geocode was not successful for the following reason:', status);
            callback(null);
        }
    });
}

function toggleExpand(event) {
    const img = event.target;
    if (img.style.width === '100%') {
        img.style.width = 'auto';
    } else {
        img.style.width = '100%';
    }
}

window.onload = initMap;
