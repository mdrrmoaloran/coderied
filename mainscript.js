const firebaseConfig = {
    apiKey: "AIzaSyCOky4VNdve1HkTWeOgWNC2Z9f67KPMgpA",
    authDomain: "coderiedcapstone-73228.firebaseapp.com",
    projectId: "coderiedcapstone-73228",
    storageBucket: "coderiedcapstone-73228.appspot.com",
    messagingSenderId: "636828786733",
    appId: "1:636828786733:web:686c4b74c65cdc1e0c18a4",
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
    getFirestore, doc, deleteDoc, updateDoc, query, getDoc, getDocs, orderBy, onSnapshot, setDoc, limit, addDoc, collection, where, Timestamp, serverTimestamp
}
    from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

import { getAuth, signOut, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('form-popup');

    loginForm?.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log('Login Successful', userCredential.user);
                alert('Login Successful');
                clearFields();
                window.location.replace('dashboard.html');
            })
            .catch((error) => {
                console.error('Error:', error.code, error.message);
                alert('Invalid Credentials');
                clearFields();
            });
    });

    function clearFields() {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout');

    if (logoutButton) {
        logoutButton.addEventListener('click', function (event) {
            event.preventDefault();

            signOut(auth)
                .then(() => {
                    console.log('User signed out successfully.');
                    window.location.replace('index.html');
                })
                .catch((error) => {
                    console.error('Error signing out:', error);
                });
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    onAuthStateChanged(auth, (user) => {
        const currentPage = window.location.pathname;

        if ((currentPage.includes('dashboard.html') || currentPage.endsWith('/dashboard')) && !user) {
            window.location.replace('index.html');
        }
    });
});

var ModEditName = document.getElementById('EditNameMod');
var ModEditAge = document.getElementById('EditAgeMod');
var ModEditGender = document.getElementById('EditGenderMod');
var ModEditLocation = document.getElementById('EditLocationMod');
var ModEditType = document.getElementById('EditTypeMod');
var ModEditDate = document.getElementById('EditDateMod');
var ModEditAct = document.getElementById('EditActMod');
var ModEditResponder = document.getElementById('EditResponderMod');
var ModEditFullname = document.getElementById('EditFullnameMod');
let currentPage = 0;
const recordsPerPage = 3;
let incidentRecords = [];

async function ShowVehicularRecords() {
    const { year, month } = getCurrentMonth();
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const startTimestamp = Timestamp.fromDate(startOfMonth);
    const endTimestamp = Timestamp.fromDate(endOfMonth);

    const currentDate = query(
        collection(db, "vehicular_records"),
        where("timestamp", ">=", startTimestamp),
        where("timestamp", "<=", endTimestamp)
    );

    const unsubscribe = onSnapshot(currentDate, (querySnapshot) => {
        incidentRecords = [];

        querySnapshot.forEach(doc => {
            incidentRecords.push(doc.data());
        });

        renderTable();
    }, (error) => {
        console.error("Error fetching vehicular records: ", error);
    });
}

function renderTable() {
    const tableBody = document.querySelector('#tbody1');
    tableBody.innerHTML = '';

    const start = currentPage * recordsPerPage;
    const end = start + recordsPerPage;
    const recordsToShow = incidentRecords.slice(start, end);

    recordsToShow.forEach((record, index) => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = record.Name || '';
        row.appendChild(nameCell);

        const ageCell = document.createElement('td');
        ageCell.textContent = record.Age || '';
        row.appendChild(ageCell);

        const genderCell = document.createElement('td');
        genderCell.textContent = record.Gender || '';
        row.appendChild(genderCell);

        const locationCell = document.createElement('td');
        locationCell.textContent = record.IncidentLocation || '';
        row.appendChild(locationCell);

        const typeCell = document.createElement('td');
        typeCell.textContent = record.IncidentType || '';
        row.appendChild(typeCell);

        const dateCell = document.createElement('td');
        dateCell.textContent = record.IncidentDate || '';
        row.appendChild(dateCell);

        const responderCell = document.createElement('td');
        responderCell.textContent = record.Responder || '';
        row.appendChild(responderCell);

        const actionCell = document.createElement('td');
        actionCell.textContent = record.Actions || '';
        row.appendChild(actionCell);

        const fullnameCell = document.createElement('td');
        fullnameCell.textContent = record.fullname || '';
        row.appendChild(fullnameCell);

        const editCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.classList.add('btn', 'btn-warning', 'btn-sm', 'btn-editrecord', 'rounded-pill');
        editButton.innerHTML = '<ion-icon name="create-outline"></ion-icon> Edit';
        editButton.setAttribute('data-bs-toggle', 'modal');
        editButton.setAttribute('data-bs-target', '#editModal');

        const fullIndex = start + index;

        if (!record.Name || !record.Age || !record.Gender || !record.IncidentLocation || !record.IncidentType || !record.IncidentDate || !record.Responder || !record.Actions || !record.fullname) {
            editButton.onclick = () => ModifyIncidentReport(fullIndex);
            editCell.appendChild(editButton);
        }

        row.appendChild(editCell);
        tableBody.appendChild(row);
    });

    updateButtonStates();
}

window.ModifyIncidentReport = (index) => {
    const record = incidentRecords[index];

    ModEditName.value = record.Name || '';
    ModEditAge.value = record.Age || '';
    ModEditGender.value = record.Gender || '';
    ModEditLocation.value = record.IncidentLocation || '';
    ModEditType.value = record.IncidentType || '';
    ModEditDate.value = record.IncidentDate || '';
    ModEditAct.value = record.Actions || '';
    ModEditResponder.value = record.Responder || '';
    ModEditFullname.value = record.fullname || '';
    ModEditDate.disabled = true;
    ModEditFullname.disabled = true;
};

function nextPage() {
    if ((currentPage + 1) * recordsPerPage < incidentRecords.length) {
        currentPage++;
        renderTable();
    }
}

function previousPage() {
    if (currentPage > 0) {
        currentPage--;
        renderTable();
    }
}

function updateButtonStates() {
    const nextButton = document.getElementById('nextButton');
    const previousButton = document.getElementById('previousButton');

    nextButton.disabled = (currentPage + 1) * recordsPerPage >= incidentRecords.length;
    previousButton.disabled = currentPage === 0;
}

document.getElementById('nextButton').addEventListener('click', nextPage);
document.getElementById('previousButton').addEventListener('click', previousPage);

ShowVehicularRecords();

document.getElementById('UpdModBtn').addEventListener('click', async () => {
    const Name = ModEditName.value.trim();
    const Age = ModEditAge.value.trim();
    const Gender = ModEditGender.value.trim();
    const IncidentLocation = ModEditLocation.value.trim();
    const IncidentType = ModEditType.value.trim();
    const IncidentDate = ModEditDate.value.trim();
    const Responder = ModEditResponder.value.trim();
    const Actions = ModEditAct.value.trim();
    const Sender = ModEditFullname.value.trim();

    try {

        const modifyincident = query(
            collection(db, "vehicular_records"),
            where("IncidentDate", "==", IncidentDate),
            where("fullname", "==", Sender),
        );

        const querySnapshot = await getDocs(modifyincident);

        if (!querySnapshot.empty) {
            querySnapshot.forEach(async (docSnapshot) => {

                const docRef = docSnapshot.ref;

                await updateDoc(docRef, {
                    Name: Name,
                    Age: Age,
                    Gender: Gender,
                    IncidentType: IncidentType,
                    IncidentLocation: IncidentLocation,
                    Responder: Responder,
                    Actions: Actions
                });

                console.log("Document successfully updated with ID: ", docSnapshot.id);
                alert('Successfully updated!');

                document.querySelectorAll('#editModal .form-control').forEach(input => input.value = '');
                checkFormValidity();
                const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
                modal.hide();
            });
        } else {
            console.log("No matching documents found.");
            alert("No document found to update.");
        }
    } catch (e) {
        console.error("Error updating document: ", e);
    }
});

document.getElementById('btn-function').addEventListener('click', function () {
    const responseMessage = 'Response is on the way';
    socket.send(responseMessage);
});

function checkFormValidity() {
    const name = document.getElementById('NameMod').value.trim();
    const age = document.getElementById('AgeMod').value.trim();
    const gender = document.getElementById('GenderMod').value.trim();
    const type = document.getElementById('TypeMod').value.trim();
    const location = document.getElementById('LocationMod').value.trim();
    const formatdate = document.getElementById('formattedDate').value.trim();
    const action = document.getElementById('ActMod').value.trim();
    const responder = document.getElementById('ResponderMod').value.trim();
    const fullname = document.getElementById('FullnameMod').value.trim();

    const allFilled = name !== '' && age !== '' && gender !== '' && type !== '' && location !== '' && formatdate !== '' && action !== '' && responder !== '' && fullname !== '';

    document.getElementById('AddModBtn').disabled = !allFilled;
}

document.getElementById('NameMod').addEventListener('input', checkFormValidity);
document.getElementById('AgeMod').addEventListener('input', checkFormValidity);
document.getElementById('GenderMod').addEventListener('input', checkFormValidity);
document.getElementById('TypeMod').addEventListener('input', checkFormValidity);
document.getElementById('LocationMod').addEventListener('input', checkFormValidity);
document.getElementById('formattedDate').addEventListener('input', checkFormValidity);
document.getElementById('ActMod').addEventListener('input', checkFormValidity);
document.getElementById('ResponderMod').addEventListener('input', checkFormValidity);
document.getElementById('FullnameMod').addEventListener('input', checkFormValidity);

document.querySelectorAll('#exampleModal .form-control').forEach(input => {
    input.addEventListener('input', checkFormValidity);
});

document.getElementById('AddModBtn').addEventListener('click', async () => {

    const name = document.getElementById('NameMod').value.trim();
    const age = document.getElementById('AgeMod').value.trim();
    const type = document.getElementById('TypeMod').value.trim();
    const gender = document.getElementById('GenderMod').value.trim();
    const location = document.getElementById('LocationMod').value.trim();
    const formatdate = document.getElementById('formattedDate').value.trim();
    const actions = document.getElementById('ActMod').value.trim();
    const responder = document.getElementById('ResponderMod').value.trim();
    const fullname = document.getElementById('FullnameMod').value.trim();

    if (!type && !location && !formatdate && !actions && !responder) {
        alert('Please fill in all fields.');
        return;
    }

    try {

        const docRef = await addDoc(collection(db, "vehicular_records"), {
            Name: name,
            Age: age,
            Gender: gender,
            IncidentType: type,
            IncidentLocation: location,
            IncidentDate: formatdate,
            Actions: actions,
            Responder: responder,
            fullname: fullname,
            timestamp: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
        alert('Successfully added!');

        document.querySelectorAll('#exampleModal .form-control').forEach(input => input.value = '');
        checkFormValidity();
        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal.hide();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
});

checkFormValidity();

const sendSMS = async (mobilenumber, message) => {
    try {
        const response = await fetch('https://server-coderied.onrender.com/send-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mobilenumber: mobilenumber,
                message: message
            })
        });

        if (!response.ok) {
            const errorResponse = await response.text(); // Parse as text
            throw new Error(`Error sending SMS: ${errorResponse}`);
        }

        console.log('SMS sent successfully!');
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const userCollection = collection(db, 'userinformation');
    const pendingQuery = query(userCollection, where('status', '==', 'pending'));
    const popupCard = document.getElementById('popupCard');
    const notificationSound = document.getElementById('notificationSound2');
    const userListContainer = document.getElementById('userList');
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationBadge = document.getElementById('notificationBadge');
    let isPlaying = false;

    const startSound = () => {
        if (!isPlaying) {
            notificationSound.play().catch(error => {
                console.error('Error playing sound:', error);
            });
            isPlaying = true;
        }
    };

    const stopSound = () => {
        if (isPlaying) {
            notificationSound.pause();
            notificationSound.currentTime = 0;
            isPlaying = false;
        }
    };

    const updateNotificationIcon = (hasPendingUsers) => {
        if (hasPendingUsers) {
            notificationIcon.classList.add('active');
            notificationBadge.textContent = '!';
        } else {
            notificationIcon.classList.remove('active');
        }
    };

    const unsubscribe = onSnapshot(pendingQuery, (querySnapshot) => {
        userListContainer.innerHTML = '';
        let hasPendingUsers = false;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            hasPendingUsers = true;

            const listItem = document.createElement('a');
            listItem.classList.add('list-group-item', 'list-group-item-action', 'bg-primary', 'text-white');

            listItem.innerHTML = `
                <div class="d-flex align-items-center">
                  <div class="d-flex flex-column me-3">
                    <h5 class="mb-1" style="font-size: 20px">${data.fullname}</h5>
                    <h2 class="mb-1" style="font-size: 12px">Username: ${data.username}</h2>
                    <p class="mb-1" style="font-size: 12px">Contact Number: ${data.mobilenumber}</p>
                    <p class="mb-1" style="font-size: 12px">Status: ${data.status}</p>
                  </div>
                  <div class="d-flex" style="margin-right: 15px;">
                    <img src="${data.selfieUrl}" style="width: 100px; height: 100px; margin-right: 15px;">
                    <img src="${data.idUrl}" alt="ID Picture" style="width: 100px; height: 100px;">
                  </div>
                  <div class="d-flex flex-column">
                    <button class="btn btn-success btn-sm mb-2 rounded-pill" onclick="approveUser('${doc.id}', '${data.mobilenumber}')">Approve</button>
                    <button class="btn btn-danger btn-sm rounded-pill" onclick="rejectUser('${doc.id}', '${data.mobilenumber}')">Reject</button>
                  </div>
                </div>
            `;
            userListContainer.appendChild(listItem);
        });

        if (hasPendingUsers) {
            popupCard.classList.add('show');
            startSound();
        } else {
            popupCard.classList.remove('show');
            stopSound();
        }

        updateNotificationIcon(hasPendingUsers);
    });

    window.unsubscribeFromUserCollection = unsubscribe;
});

window.approveUser = async (userId, mobilenumber) => {
    const userDoc = doc(db, 'userinformation', userId);

    try {
        await updateDoc(userDoc, { status: 'approved' });
        alert('User approved!');
        await sendSMS(mobilenumber, 'Your account has been approved by MDDRMO Aloran!');
    } catch (error) {
        console.error('Error approving user:', error);
        alert('Failed to approve user.');
    }
};

window.rejectUser = async (userId, mobilenumber) => {
    const userDoc = doc(db, 'userinformation', userId);

    try {
        await deleteDoc(userDoc, { status: 'rejected' });
        alert('User rejected!');
        await sendSMS(mobilenumber, 'Your account has been rejected by MDRRMO Aloran.');
    } catch (error) {
        console.error('Error rejecting user:', error);
        alert('Failed to reject user.');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const userCollection = collection(db, 'message');
    const pendingQuerymessage = query(userCollection, where('message', '==', 'message'));
    const popupCardmessage = document.getElementById('popupCardmessage');
    const messageListContainer = document.getElementById('messageList');
    const messageIcon = document.getElementById('messageIcon');
    const messageBadge = document.getElementById('messageBadge');

    const updateNotificationIcon = (hasMessage) => {
        if (hasMessage) {
            messageIcon.classList.add('active');
            messageBadge.textContent = '!';
        } else {
            messageIcon.classList.remove('active');
        }
    };

    onSnapshot(pendingQuerymessage, async (querySnapshotmessage) => {
        messageListContainer.innerHTML = '';
        let hasMessage = false;

        for (const docmessage of querySnapshotmessage.docs) {
            const datamessage = docmessage.data();
            hasMessage = true;

            const listItem = document.createElement('a');
            listItem.classList.add('list-group-item', 'list-group-item-action', 'bg-primary', 'text-white');

            listItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="d-flex" style="margin-right: 5px; margin-left: 5px;">
                        <img src="${datamessage.selfieUrl}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover">
                    </div>
                    <div class="d-flex flex-column me-3">
                        <h5 class="mb-1" style="font-size: 20px; text-align: left;">Sender: ${datamessage.fullname}</h5>
                        <p class="mb-1" style="font-size: 15px; text-align: left;">Contact: ${datamessage.mobilenumber}</p>
                        <h5 class="mb-1" style="font-size: 30px; text-align: left;">Type: ${datamessage.IncidentType}</h5>
                        <h4 class="mb-1" style="font-size: 15px; text-align: left;">Location: ${datamessage.IncidentLocation}</h4>
                        <p class="mb-1" style="font-size: 15px; text-align: left;">Date: ${datamessage.IncidentDate}</p>
                    </div>
                    <div class="d-flex" style="margin-right: 15px; margin-top: 5px; margin-bottom: 5px;">
                        <img src="${datamessage.image}" style="width: 250px; height: 200px;">
                    </div>
                    <div class="d-flex flex-column">
                        <button class="btn btn-danger btn-sm rounded-pill" onclick="deleteMessage('${docmessage.id}')">Delete Message</button>
                        <button class="btn btn-success btn-sm rounded-pill mt-2" onclick="saveAndRemove('${docmessage.id}')">Save and Remove</button>
                    </div>
                </div>
            `;
            messageListContainer.appendChild(listItem);
        }

        if (hasMessage) {
            popupCardmessage.classList.add('show');
        } else {
            popupCardmessage.classList.remove('show');
        }

        updateNotificationIcon(hasMessage);
    });

    window.deleteMessage = async (userId) => {
        const messageDoc = doc(db, 'message', userId);

        try {
            await deleteDoc(messageDoc);
            alert('Message removed!');
        } catch (error) {
            console.error('Error rejecting user:', error);
            alert('Failed to reject and remove user.');
        }
    };

    window.saveAndRemove = async (userId) => {
        const messageDoc = doc(db, 'message', userId);
        const vehicularRecordsCollection = collection(db, 'vehicular_records');

        try {
            const messageSnapshot = await getDoc(messageDoc);
            if (messageSnapshot.exists()) {
                const messageData = messageSnapshot.data();

                const dataToSave = {
                    ...messageData,
                    Name: '',
                    Age: '',
                    Gender: '',
                    Actions: '',
                    Responder: ''
                };

                await addDoc(vehicularRecordsCollection, dataToSave);
                await deleteDoc(messageDoc);

                alert('Saved to Incident Reports Successfully');
            } else {
                alert('No such message!');
            }
        } catch (error) {
            console.error('Error saving and removing message:', error);
            alert('Failed to save and remove message.');
        }
    };
});

async function fetchAndDrawChart() {
    const currentDategraph = new Date();
    const currentMonthgraph = currentDategraph.getMonth();
    const currentYeargraph = currentDategraph.getFullYear();
    const ctx = document.getElementById('vehiculargraph').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Vehicular', 'Flood', 'Landslide', 'Assistance'],
            datasets: [{
                label: 'Incident Volume',
                data: [0, 0, 0, 0],
                borderWidth: 5,
                barThickness: 200,
                borderColor: 'white',
                backgroundColor: ['#FF3131', '#1F51FF', '#765341', '#0FFF50']
            }]
        },
        options: {
            layout: {
                padding: {
                    left: 40,
                    right: 40,
                }
            },
            plugins: {
                customCanvasBackgroundColor: {
                    color: 'white'
                },
                title: {
                    display: false
                },
                legend: {
                    labels: {
                        font: {
                            size: 20,
                            weight: 'bold',
                            color: 'white'
                        }
                    }
                }
            },
            responsive: true,
            scales: {
                y: {
                    ticks: {
                        stepSize: 1,
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Incidents',
                        color: 'white',
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });

    const unsubscribe = onSnapshot(collection(db, "vehicular_records"), (snapshot) => {
        let vehicularCount = 0;
        let floodCount = 0;
        let landslideCount = 0;
        let assistanceCount = 0;

        snapshot.forEach(doc => {
            const datagraph = doc.data();
            const incidentDategraph = datagraph.timestamp ? datagraph.timestamp.toDate() : null;

            if (incidentDategraph && incidentDategraph.getMonth() === currentMonthgraph && incidentDategraph.getFullYear() === currentYeargraph) {
                const IncidentType = datagraph.IncidentType;
                switch (IncidentType) {
                    case 'vehicular':
                        vehicularCount++;
                        break;
                    case 'flood':
                        floodCount++;
                        break;
                    case 'landslide':
                        landslideCount++;
                        break;
                    case 'assistance':
                        assistanceCount++;
                        break;
                    default:
                        break;
                }
            }
        });

        myChart.data.datasets[0].data = [vehicularCount, floodCount, landslideCount, assistanceCount];
        myChart.update();
    });
}

fetchAndDrawChart();

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');

    if (!db) {
        console.error('Firestore instance is not initialized');
        return;
    }

    const incidentListDiv = document.getElementById('tableContainer');
    const monthFilter = document.getElementById('monthFilter');
    const yearFilter = document.getElementById('yearFilter');

    const populateYearFilter = () => {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 2023; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        }
    };

    const renderTable = async (querySnapshot) => {
        if (querySnapshot.empty) {
            incidentListDiv.innerHTML = '<p class="no-records-message">No records found.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'table table-striped';
        table.style.marginTop = '0';
        table.style.marginBottom = '0';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const headers = [
            { displayName: 'Full Name', key: 'Name' },
            { displayName: 'Incident Type', key: 'IncidentType' },
            { displayName: 'Incident Location', key: 'IncidentLocation' },
            { displayName: 'Date of Incident', key: 'IncidentDate' },
            { displayName: 'Gender', key: 'Gender' },
            { displayName: 'Responder', key: 'Responder' },
            { displayName: 'Age', key: 'Age' },
            { displayName: 'Action Taken', key: 'Actions' },
            { displayName: 'Sender/Caller', key: 'fullname' }
        ];

        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.displayName;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        querySnapshot.forEach(doc => {
            const record = doc.data();
            const row = document.createElement('tr');

            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = record[header.key] || '';
                row.appendChild(td);
            });

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        incidentListDiv.innerHTML = '';
        incidentListDiv.appendChild(table);
    };

    const setupListener = () => {
        let month = monthFilter.value;
        let year = yearFilter.value;
        let queryConstraints = [orderBy('timestamp', 'desc')];

        if (month) {
            queryConstraints.push(where('timestamp', '>=', new Date(year, month, 1)));
            queryConstraints.push(where('timestamp', '<', new Date(year, parseInt(month) + 1, 1)));
        } else if (year) {
            queryConstraints.push(where('timestamp', '>=', new Date(year, 0, 1)));
            queryConstraints.push(where('timestamp', '<', new Date(parseInt(year) + 1, 0, 1)));
        }

        const allrecord = query(collection(db, 'vehicular_records'), ...queryConstraints);
        const unsubscribe = onSnapshot(allrecord, (querySnapshot) => {
            renderTable(querySnapshot);
        }, (error) => {
            console.error('Error fetching incident records:', error);
            incidentListDiv.innerHTML = '<p class="no-records-message">Failed to load records.</p>';
        });

        return unsubscribe;
    };

    populateYearFilter();

    let unsubscribe = setupListener();

    monthFilter.addEventListener('change', () => {
        unsubscribe();
        unsubscribe = setupListener();
    });

    yearFilter.addEventListener('change', () => {
        unsubscribe();
        unsubscribe = setupListener();
    });
});

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');

    if (!db) {
        console.error('Firestore instance is not initialized');
        return;
    }

    const approvedUsersList = document.querySelector('#approvedUsersList tbody');

    const renderApprovedUsersList = (querySnapshot) => {
        approvedUsersList.innerHTML = ''; // Clear table body before rendering

        if (querySnapshot.empty) {
            approvedUsersList.innerHTML = '<tr><td colspan="5" class="text-center">No approved users found.</td></tr>';
            return;
        }

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const row = document.createElement('tr'); // Create a table row

            row.innerHTML = `
                <td><img src="${data.selfieUrl}" class="user-image-table"></td>
                <td>${data.fullname}</td>
                <td>${data.username}</td>
                <td>${data.mobilenumber}</td>
                <td>${doc.id}</td>
                <td><button class="btn btn-danger btn-sm rounded-pill" onclick="deleteUser('${doc.id}')">Remove User</button></td>
            `;

            approvedUsersList.appendChild(row);
        });
    };

    window.deleteUser = async (userId) => {
        const userDoc = doc(db, 'approvedUsers', userId);

        try {
            await deleteDoc(userDoc);
            alert('User deleted successfully!');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user.');
        }
    };

    const setupApprovedUsersListener = () => {
        const approvedUsers = collection(db, 'approvedUsers');
        return onSnapshot(approvedUsers, (querySnapshot) => {
            renderApprovedUsersList(querySnapshot);
        }, (error) => {
            console.error('Error fetching approved users:', error);
            approvedUsersList.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load approved users.</td></tr>';
        });
    };

    setupApprovedUsersListener();
});

