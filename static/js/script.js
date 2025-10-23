// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Navigation toggle for mobile
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const regionFilter = document.getElementById('regionFilter');
    const searchResults = document.getElementById('searchResults');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    if (regionFilter) {
        regionFilter.addEventListener('change', performSearch);
    }
    
    // Case details modal
    document.querySelectorAll('.btn-case-details').forEach(button => {
        button.addEventListener('click', function() {
            const personId = this.getAttribute('data-person-id');
            showCaseDetails(personId);
        });
    });
    
    // Modal close functionality
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Form submissions
    const missingPersonForm = document.getElementById('missingPersonForm');
    if (missingPersonForm) {
        missingPersonForm.addEventListener('submit', handleMissingPersonForm);
    }
    
    const volunteerForm = document.getElementById('volunteerForm');
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', handleVolunteerForm);
    }
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    const sightingForm = document.getElementById('sightingForm');
    if (sightingForm) {
        sightingForm.addEventListener('submit', handleSightingForm);
    }
}

// Search function
async function performSearch() {
    const query = document.getElementById('searchInput').value;
    const region = document.getElementById('regionFilter').value;
    const searchResults = document.getElementById('searchResults');
    
    if (!query && !region) {
        searchResults.innerHTML = '<p>Please enter a search term or select a region.</p>';
        return;
    }
    
    try {
        const response = await fetch(`/search?q=${encodeURIComponent(query)}&region=${encodeURIComponent(region)}`);
        const results = await response.json();
        
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = '<p>Sorry, there was an error performing your search. Please try again.</p>';
    }
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p>No matching cases found. Please try different search terms.</p>';
        return;
    }
    
    let html = '<div class="cases-grid">';
    
    results.forEach(person => {
        html += `
            <div class="case-card">
                <div class="case-image">
                    <img src="${person.photo_url}" alt="${person.name}">
                </div>
                <div class="case-info">
                    <h3>${person.name}</h3>
                    <p><strong>Age:</strong> ${person.age}</p>
                    <p><strong>Last Seen:</strong> ${person.last_seen}</p>
                    <p><strong>Date:</strong> ${person.last_seen_date}</p>
                    <button class="btn-case-details" data-person-id="${person.id}">View Details</button>
                    <button class="btn-report-sighting" data-person-id="${person.id}">Report Sighting</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    searchResults.innerHTML = html;
    
    // Reattach event listeners to new buttons
    document.querySelectorAll('.btn-case-details').forEach(button => {
        button.addEventListener('click', function() {
            const personId = this.getAttribute('data-person-id');
            showCaseDetails(personId);
        });
    });
    
    document.querySelectorAll('.btn-report-sighting').forEach(button => {
        button.addEventListener('click', function() {
            const personId = this.getAttribute('data-person-id');
            showSightingForm(personId);
        });
    });
}

// Show case details in modal
async function showCaseDetails(personId) {
    try {
        const response = await fetch('/search');
        const allPersons = await response.json();
        const person = allPersons.find(p => p.id == personId);
        
        if (!person) {
            alert('Case details not found.');
            return;
        }
        
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = `
            <h2>${person.name}</h2>
            <div class="case-details">
                <div class="detail-image">
                    <img src="${person.photo_url}" alt="${person.name}">
                </div>
                <div class="detail-info">
                    <p><strong>Age:</strong> ${person.age}</p>
                    <p><strong>Gender:</strong> ${person.gender}</p>
                    <p><strong>Last Seen:</strong> ${person.last_seen}</p>
                    <p><strong>Last Seen Date:</strong> ${person.last_seen_date}</p>
                    <p><strong>Region:</strong> ${person.region}</p>
                    <p><strong>Description:</strong> ${person.description}</p>
                    <div class="contact-info">
                        <h3>Contact Information</h3>
                        <p><strong>Contact:</strong> ${person.contact_name}</p>
                        <p><strong>Phone:</strong> ${person.contact_phone}</p>
                        <p><strong>Email:</strong> ${person.contact_email}</p>
                    </div>
                    <button class="btn btn-primary btn-report-sighting-modal" data-person-id="${person.id}">Report Sighting</button>
                </div>
            </div>
        `;
        
        document.getElementById('caseModal').style.display = 'block';
        
        // Attach event listener to the report sighting button in the modal
        document.querySelector('.btn-report-sighting-modal').addEventListener('click', function() {
            showSightingForm(personId);
        });
        
    } catch (error) {
        console.error('Error fetching case details:', error);
        alert('Error loading case details. Please try again.');
    }
}

// Show sighting report form
function showSightingForm(personId) {
    document.getElementById('sightingPersonId').value = personId;
    document.getElementById('sightingModal').style.display = 'block';
    
    // Close the case details modal if it's open
    document.getElementById('caseModal').style.display = 'none';
}

// Handle missing person form submission
async function handleMissingPersonForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/report-missing', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Thank you for submitting the report. We will review it and add it to our database.');
            form.reset();
        } else {
            alert('There was an error submitting your report. Please try again.');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        alert('There was an error submitting your report. Please try again.');
    }
}

// Handle volunteer form submission
async function handleVolunteerForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/volunteer-signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Thank you for signing up as a volunteer! We will contact you soon.');
            form.reset();
        } else {
            alert('There was an error with your submission. Please try again.');
        }
    } catch (error) {
        console.error('Volunteer form error:', error);
        alert('There was an error with your submission. Please try again.');
    }
}

// Handle contact form submission
function handleContactForm(e) {
    e.preventDefault();
    alert('Thank you for your message. We will respond as soon as possible.');
    e.target.reset();
}

// Handle sighting form submission
async function handleSightingForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const personId = document.getElementById('sightingPersonId').value;
    const data = {
        personId: personId,
        location: document.getElementById('sighting_location').value,
        date: document.getElementById('sighting_date').value,
        details: document.getElementById('sighting_details').value,
        reporterName: document.getElementById('reporter_name').value,
        reporterContact: document.getElementById('reporter_contact').value
    };
    
    try {
        const response = await fetch('/report-sighting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Thank you for reporting this sighting. This information could be crucial in reuniting a family.');
            form.reset();
            document.getElementById('sightingModal').style.display = 'none';
        } else {
            alert('There was an error submitting your report. Please try again.');
        }
    } catch (error) {
        console.error('Sighting report error:', error);
        alert('There was an error submitting your report. Please try again.');
    }
}

// Add some sample animations for page elements
function animateOnScroll() {
    const elements = document.querySelectorAll('.case-card, .found-card, .form-group');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// Initialize animations when page loads
window.addEventListener('load', animateOnScroll);