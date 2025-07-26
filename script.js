// --- Aurora Background Animation ---
const auroraCanvas = document.getElementById('auroraCanvas');
const auroraCtx = auroraCanvas.getContext('2d');
let auroraParticles = [];
let auroraMouse = { x: undefined, y: undefined };

const auroraConfig = {
    numParticles: 100,
    maxSize: 3,
    minSize: 1,
    speed: 0.05, // Slower movement
    connectionDistance: 100,
    glowRadius: 120, // Larger glow
    colors: [
        { r: 0, g: 123, b: 255 },    // Primary Blue
        { r: 40, g: 167, b: 69 },    // Secondary Green
        { r: 173, g: 216, b: 230 },  // Light Blue (Subtle for aurora)
        { r: 25, g: 25, b: 112 }     // Midnight Blue (Deeper tones)
    ]
};

function resizeAuroraCanvas() {
    auroraCanvas.width = window.innerWidth;
    auroraCanvas.height = window.innerHeight;
    initAuroraParticles();
}

window.addEventListener('resize', resizeAuroraCanvas);
window.addEventListener('mousemove', function(event) {
    auroraMouse.x = event.x;
    auroraMouse.y = event.y;
});
window.addEventListener('mouseout', function() {
    auroraMouse.x = undefined;
    auroraMouse.y = undefined;
});

class AuroraParticle {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * auroraConfig.speed,
            y: (Math.random() - 0.5) * auroraConfig.speed
        };
        this.opacity = 0;
        this.life = 0; // Current life in frames
        this.maxLife = 200 + Math.random() * 300; // Longer life for slower fade
    }

    draw() {
        auroraCtx.beginPath();
        auroraCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        auroraCtx.fillStyle = rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity});
        auroraCtx.fill();
    }

    update() {
        this.life++;

        // Fade in
        if (this.life < 60) {
            this.opacity = this.life / 60;
        } else if (this.life > this.maxLife - 60) { // Fade out
            this.opacity = (this.maxLife - this.life) / 60;
        } else {
            this.opacity = 1;
        }

        // If particle has faded out, mark for removal
        if (this.life >= this.maxLife || this.opacity <= 0.01) {
            return false;
        }

        // Apply movement
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Wrap around screen edges
        if (this.x < 0) this.x = auroraCanvas.width;
        if (this.x > auroraCanvas.width) this.x = 0;
        if (this.y < 0) this.y = auroraCanvas.height;
        if (this.y > auroraCanvas.height) this.y = 0;

        // Subtle mouse repulsion/attraction
        if (auroraMouse.x !== undefined && auroraMouse.y !== undefined) {
            const dx = auroraMouse.x - this.x;
            const dy = auroraMouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < auroraConfig.glowRadius) {
                const repulsionForce = (auroraConfig.glowRadius - distance) / auroraConfig.glowRadius * 0.5;
                this.x -= dx * repulsionForce * 0.005; // Weaker effect
                this.y -= dy * repulsionForce * 0.005;
            }
        }

        this.draw();
        return true;
    }
}

function getRandomAuroraColor() {
    const baseColor = auroraConfig.colors[Math.floor(Math.random() * auroraConfig.colors.length)];
    // Add slight random variations for a more organic feel
    return {
        r: Math.min(255, Math.max(0, baseColor.r + (Math.random() - 0.5) * 50)),
        g: Math.min(255, Math.max(0, baseColor.g + (Math.random() - 0.5) * 50)),
        b: Math.min(255, Math.max(0, baseColor.b + (Math.random() - 0.5) * 50))
    };
}

function initAuroraParticles() {
    auroraParticles = [];
    for (let i = 0; i < auroraConfig.numParticles; i++) {
        const x = Math.random() * auroraCanvas.width;
        const y = Math.random() * auroraCanvas.height;
        const size = Math.random() * (auroraConfig.maxSize - auroraConfig.minSize) + auroraConfig.minSize;
        auroraParticles.push(new AuroraParticle(x, y, size, getRandomAuroraColor()));
    }
}

function animateAurora() {
    requestAnimationFrame(animateAurora);
    // Create a subtle trail effect
    auroraCtx.fillStyle = 'rgba(10, 27, 44, 0.05)'; // Very subtle fade
    auroraCtx.fillRect(0, 0, auroraCanvas.width, auroraCanvas.height);

    const activeParticles = [];
    auroraParticles.forEach(p => {
        if (p.update()) {
            activeParticles.push(p);
        } else {
            // Re-spawn a new particle when one dies
            const x = Math.random() * auroraCanvas.width;
            const y = Math.random() * auroraCanvas.height;
            const size = Math.random() * (auroraConfig.maxSize - auroraConfig.minSize) + auroraConfig.minSize;
            activeParticles.push(new AuroraParticle(x, y, size, getRandomAuroraColor()));
        }
    });
    auroraParticles = activeParticles;

    // Draw lines between nearby particles
    for (let a = 0; a < auroraParticles.length; a++) {
        for (let b = a; b < auroraParticles.length; b++) {
            const dx = auroraParticles[a].x - auroraParticles[b].x;
            const dy = auroraParticles[a].y - auroraParticles[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < auroraConfig.connectionDistance) {
                const opacity = (1 - (distance / auroraConfig.connectionDistance)) * Math.min(auroraParticles[a].opacity, auroraParticles[b].opacity);
                auroraCtx.beginPath();
                auroraCtx.strokeStyle = rgba(0, 123, 255, ${opacity * 0.2}); // Primary blue lines, very faint
                auroraCtx.lineWidth = 0.5;
                auroraCtx.moveTo(auroraParticles[a].x, auroraParticles[a].y);
                auroraCtx.lineTo(auroraParticles[b].x, auroraParticles[b].y);
                auroraCtx.stroke();
            }
        }
    }
}

// Initial setup for aurora
resizeAuroraCanvas();
animateAurora();


// --- Burger Menu Functionality ---
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    nav.classList.toggle('nav-active');
    burger.classList.toggle('nav-active'); // For animation of burger icon
});

// Close nav when a link is clicked (for smooth scrolling)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (nav.classList.contains('nav-active')) {
            nav.classList.remove('nav-active');
            burger.classList.remove('nav-active');
        }
    });
});

// --- Membership Form Submission ---
const membershipForm = document.getElementById('membershipForm');
const membershipSuccessMessage = document.getElementById('membershipSuccessMessage');

membershipForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = {
        name: document.getElementById('memberName').value,
        email: document.getElementById('memberEmail').value,
        phone: document.getElementById('memberPhone').value,
        college: document.getElementById('memberCollege').value,
        interest: document.getElementById('memberInterest').value
    };

    // For demonstration: Simulate success after a short delay
    console.log("Membership Application Submitted:", formData);
    membershipSuccessMessage.textContent = 'Details successfully uploaded! We\'ll be in touch soon.';
    membershipSuccessMessage.style.display = 'block';
    membershipSuccessMessage.style.color = 'var(--success-color)';
    membershipForm.reset(); // Clear the form

    setTimeout(() => {
        membershipSuccessMessage.style.display = 'none'; // Hide message after some time
    }, 5000); // 5 seconds
});


// --- Admin Panel Logic ---
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminPanel = document.getElementById('adminPanel');
const closeAdminPanel = document.getElementById('closeAdminPanel');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginError = document.getElementById('adminLoginError');
const eventManagementSection = document.getElementById('eventManagementSection');
const addEventForm = document.getElementById('addEventForm');
const addEventMessage = document.getElementById('addEventMessage');
const currentEventsList = document.getElementById('currentEventsList');
const eventGrid = document.getElementById('eventGrid');

// Simple hardcoded credentials (DO NOT USE IN PRODUCTION)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';

// Load events from localStorage or use a default
let events = JSON.parse(localStorage.getItem('rotaractEvents')) || [
    { id: 'e1', name: '[Annual Blood Donation Camp]', date: '2025-08-15', time: '10:00 AM', venue: 'College Auditorium', description: 'Our flagship event to contribute to the community blood bank. Your single drop can save a life!', type: 'upcoming' },
    { id: 'e2', name: '[Leadership Workshop Series]', date: '2025-09-01', time: '02:00 PM', venue: 'Seminar Hall', description: 'Develop essential leadership skills with interactive sessions and expert speakers.', type: 'upcoming' },
    { id: 'e3', name: '[Tree Plantation Drive]', date: '2025-06-05', time: '09:00 AM', venue: 'Local Park', description: 'We successfully planted over 200 saplings, contributing to a greener Ahmedabad.', type: 'past' },
    { id: 'e4', name: '[Inter-Club Fellowship Meet]', date: '2025-05-20', time: '06:00 PM', venue: 'XYZ Cafe', description: 'A fun evening of networking and fellowship with other Rotaract clubs in the district.', type: 'past' }
];

function saveEvents() {
    localStorage.setItem('rotaractEvents', JSON.stringify(events));
}

function displayEvents() {
    eventGrid.innerHTML = ''; // Clear current events on public page
    currentEventsList.innerHTML = ''; // Clear current events in admin panel

    const upcomingEvents = events.filter(e => e.type === 'upcoming').sort((a, b) => new Date(a.date) - new Date(b.date));
    const pastEvents = events.filter(e => e.type === 'past').sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort past events by latest first

    if (upcomingEvents.length === 0 && pastEvents.length === 0) {
        eventGrid.innerHTML = '<p style="text-align: center; color: var(--text-color-light);">No events currently scheduled or recorded. Check back soon!</p>';
        currentEventsList.innerHTML = '<li>No events to display.</li>';
        return;
    }

    // Display upcoming events first
    upcomingEvents.forEach(event => {
        const eventCard = `
            <div class="event-card">
                <h3>${event.name}</h3>
                <p><i class="fas fa-calendar-alt"></i> Date: ${new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${event.time ? 'at ' + event.time : ''}</p>
                <p><i class="fas fa-map-marker-alt"></i> Venue: ${event.venue}</p>
                <p>${event.description}</p>
                <a href="#" class="btn btn-small">Learn More</a>
            </div>
        `;
        eventGrid.insertAdjacentHTML('beforeend', eventCard);
    });

    // Then display past events
    pastEvents.forEach(event => {
        const eventCard = `
            <div class="event-card">
                <h3>${event.name} Highlights</h3>
                <p><i class="fas fa-calendar-alt"></i> Date: ${new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p>${event.description}</p>
                <a href="#" class="btn btn-small">View Photos</a>
            </div>
        `;
        eventGrid.insertAdjacentHTML('beforeend', eventCard);
    });

    // Populate admin list
    events.forEach(event => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="event-details">
                <strong>${event.name}</strong><br>
                <span>${new Date(event.date).toLocaleDateString('en-GB')} - ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</span>
            </div>
            <button class="delete-btn" data-id="${event.id}">Delete</button>
        `;
        currentEventsList.appendChild(listItem);
    });

    // Attach delete event listeners
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.dataset.id;
            events = events.filter(e => e.id !== eventId);
            saveEvents();
            displayEvents(); // Re-render lists
        });
    });
}

// Show admin panel
adminLoginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    adminPanel.classList.add('show');
    adminLoginError.style.display = 'none';
    eventManagementSection.style.display = 'none'; // Hide management until logged in
    adminLoginForm.style.display = 'block'; // Show login form
});

// Close admin panel
closeAdminPanel.addEventListener('click', function() {
    adminPanel.classList.remove('show');
    adminLoginForm.reset();
});

// Admin login form submission
adminLoginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        adminLoginError.style.display = 'none';
        adminLoginForm.style.display = 'none';
        eventManagementSection.style.display = 'block';
        displayEvents(); // Load events into admin panel
    } else {
        adminLoginError.style.display = 'block';
    }
});

// Add new event form submission
addEventForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const newEvent = {
        id: 'e' + Date.now(), // Unique ID
        name: document.getElementById('eventName').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        venue: document.getElementById('eventVenue').value,
        description: document.getElementById('eventDescription').value,
        type: document.getElementById('eventType').value
    };

    events.push(newEvent);
    saveEvents();
    displayEvents(); // Re-render lists

    addEventMessage.textContent = 'Event added successfully!';
    addEventMessage.style.display = 'block';
    addEventForm.reset(); // Clear form

    setTimeout(() => {
        addEventMessage.style.display = 'none';
    }, 3000);
});

// Initial display of events when page loads
document.addEventListener('DOMContentLoaded', displayEvents);
