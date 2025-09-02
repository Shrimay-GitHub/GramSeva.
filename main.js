// Main JavaScript for// Village Connect - Service Request System
// Frontend JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initMobileNavigation();
    loadStatistics();
    initSidebarInteractions();
    initServiceDetailsModals();
    initSidebarMenu();
    
    // Initialize form handlers
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', handleFormSubmit);
    }
    
    const photoInput = document.getElementById('photo');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoPreview);
    }
});

// Initialize mobile navigation
function initMobileNavigation() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            
            // Update button icon
            if (mobileNav.classList.contains('active')) {
                mobileMenuBtn.textContent = '✕';
            } else {
                mobileMenuBtn.textContent = '☰';
            }
        });
        
        // Close mobile nav when clicking on links
        const mobileNavLinks = mobileNav.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
                mobileMenuBtn.textContent = '☰';
            });
        });
        
        // Close mobile nav when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileNav.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                mobileNav.classList.remove('active');
                mobileMenuBtn.textContent = '☰';
            }
        });
    }
}

// Initialize service card interactions
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const serviceType = this.classList[1]; // Get the service type class
            handleServiceCardClick(serviceType);
        });
        
        // Add touch feedback for mobile
        card.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        card.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
}

// Handle service card clicks
function handleServiceCardClick(serviceType) {
    console.log('Service selected:', serviceType);
    // TODO: Navigate to service-specific form or filter
    // For now, scroll to services section
    document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
}

// Initialize sidebar interactions
function initSidebarInteractions() {
    const reportBtn = document.querySelector('.report-btn');
    const emergencyBtn = document.querySelector('.emergency-btn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (reportBtn) {
        reportBtn.addEventListener('click', function() {
            showReportForm();
        });
    }
    
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', function() {
            showReportForm('High');
        });
    }
    
    if (closeFormBtn) {
        closeFormBtn.addEventListener('click', hideReportForm);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideReportForm);
    }
    
    // Handle sidebar menu clicks
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Handle the navigation
            const text = this.textContent.trim();
            handleSidebarNavigation(text);
        });
    });
}

// Handle sidebar navigation
function handleSidebarNavigation(text) {
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section, .services-grid, .hero-section');
    sections.forEach(section => section.style.display = 'none');
    
    if (text.includes('All Services')) {
        document.querySelector('.hero-section').style.display = 'block';
        document.querySelector('.services-grid').style.display = 'grid';
    } else if (text.includes('My Requests')) {
        document.getElementById('my-requests').style.display = 'block';
        loadMyRequests();
    } else if (text.includes('Settings')) {
        document.getElementById('settings').style.display = 'block';
        initializeSettings();
    } else if (text.includes('Help')) {
        document.getElementById('help').style.display = 'block';
    } else {
        // Service-specific filtering
        document.querySelector('.hero-section').style.display = 'block';
        document.querySelector('.services-grid').style.display = 'grid';
        filterServicesByCategory(text);
    }
}

// Load user's requests
async function loadMyRequests() {
    const requestsList = document.getElementById('requests-list');
    
    try {
        const response = await fetch('/api/issues');
        const issues = await response.json();
        
        // Sample data for demo (replace with actual user-specific data)
        const sampleRequests = [
            {
                issueId: 'REQ-2024-001',
                category: '💧 Water Supply',
                description: 'Water supply has been disrupted in our area for the past 3 days. Multiple households affected.',
                status: 'In Progress',
                createdAt: '2024-01-15',
                village: 'Mumbai, Maharashtra'
            },
            {
                issueId: 'REQ-2024-002',
                category: '🛣️ Roads',
                description: 'Large pothole on main road causing traffic issues and vehicle damage.',
                status: 'Resolved',
                createdAt: '2024-01-10',
                village: 'Mumbai, Maharashtra'
            },
            {
                issueId: 'REQ-2024-003',
                category: '⚡ Electricity',
                description: 'Street lights not working on Park Street for over a week.',
                status: 'Pending',
                createdAt: '2024-01-20',
                village: 'Mumbai, Maharashtra'
            }
        ];
        
        displayRequests(sampleRequests);
        initializeRequestFilters(sampleRequests);
        
    } catch (error) {
        console.error('Error loading requests:', error);
        requestsList.innerHTML = '<p>Unable to load requests. Please try again later.</p>';
    }
}

// Display requests
function displayRequests(requests, filter = 'all') {
    const requestsList = document.getElementById('requests-list');
    
    const filteredRequests = filter === 'all' 
        ? requests 
        : requests.filter(req => req.status === filter);
    
    if (filteredRequests.length === 0) {
        requestsList.innerHTML = '<p>No requests found.</p>';
        return;
    }
    
    requestsList.innerHTML = filteredRequests.map(request => `
        <div class="request-card">
            <div class="request-header">
                <div class="request-id">${request.issueId}</div>
                <div class="request-status status-${request.status.toLowerCase().replace(' ', '-')}">
                    ${request.status}
                </div>
            </div>
            <div class="request-category">${request.category}</div>
            <div class="request-description">${request.description}</div>
            <div class="request-meta">
                <span>📍 ${request.village}</span>
                <span>📅 ${new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

// Initialize request filters
function initializeRequestFilters(requests) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter requests
            const filter = this.dataset.filter;
            displayRequests(requests, filter);
        });
    });
}

// Initialize settings
function initializeSettings() {
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const profileData = {
                name: document.getElementById('profile-name').value,
                email: document.getElementById('profile-email').value,
                phone: document.getElementById('profile-phone').value,
                village: document.getElementById('profile-village').value
            };
            
            // Simulate API call
            setTimeout(() => {
                showAlert('success', 'Profile updated successfully!');
            }, 500);
        });
    }
    
    // Toggle switches
    const toggles = document.querySelectorAll('.toggle-switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const setting = this.closest('.setting-item').querySelector('strong').textContent;
            const enabled = this.checked;
            
            console.log(`${setting}: ${enabled ? 'Enabled' : 'Disabled'}`);
            
            // Show feedback
            showAlert('success', `${setting} ${enabled ? 'enabled' : 'disabled'}`);
        });
    });
}

// Filter services by category
function filterServicesByCategory(category) {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        const cardCategory = card.querySelector('.service-title').textContent;
        
        if (category.includes('All Services') || cardCategory.toLowerCase().includes(category.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Help modal functions
function showHelpModal(type) {
    const modal = document.getElementById('help-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    const helpContent = {
        report: {
            title: 'How to Report an Issue',
            content: `
                <h4>Step-by-Step Guide:</h4>
                <ol>
                    <li><strong>Click "New Request"</strong> - Use the button in the sidebar</li>
                    <li><strong>Fill Required Fields</strong> - Name, village, category, and description</li>
                    <li><strong>Add Details</strong> - Provide specific location and clear description</li>
                    <li><strong>Upload Photo</strong> - Add visual evidence (optional but recommended)</li>
                    <li><strong>Submit</strong> - You'll receive a tracking ID</li>
                </ol>
                <h4>Tips for Better Reports:</h4>
                <ul>
                    <li>Be specific about the location</li>
                    <li>Describe the impact on the community</li>
                    <li>Include photos showing the issue clearly</li>
                    <li>Choose the correct category</li>
                </ul>
            `
        },
        track: {
            title: 'Track Your Requests',
            content: `
                <h4>Tracking Methods:</h4>
                <ul>
                    <li><strong>My Requests</strong> - View all your submissions in the sidebar</li>
                    <li><strong>Tracking ID</strong> - Use the ID provided after submission</li>
                    <li><strong>Status Updates</strong> - Get notifications when status changes</li>
                </ul>
                <h4>Status Meanings:</h4>
                <ul>
                    <li><span class="request-status status-pending">Pending</span> - Request received, awaiting review</li>
                    <li><span class="request-status status-progress">In Progress</span> - Work has started</li>
                    <li><span class="request-status status-resolved">Resolved</span> - Issue has been fixed</li>
                </ul>
            `
        },
        emergency: {
            title: 'Emergency Contacts',
            content: `
                <h4>Emergency Services:</h4>
                <ul>
                    <li><strong>Police:</strong> 100</li>
                    <li><strong>Fire Department:</strong> 101</li>
                    <li><strong>Ambulance:</strong> 108</li>
                    <li><strong>Disaster Management:</strong> 1078</li>
                </ul>
                <h4>Local Authorities:</h4>
                <ul>
                    <li><strong>Municipal Office:</strong> +91 22 2266 0000</li>
                    <li><strong>Water Department:</strong> +91 22 2266 1111</li>
                    <li><strong>Electricity Board:</strong> +91 22 2266 2222</li>
                    <li><strong>Public Works:</strong> +91 22 2266 3333</li>
                </ul>
                <p><strong>For urgent issues, use the Emergency button when reporting!</strong></p>
            `
        }
    };
    
    const content = helpContent[type];
    title.textContent = content.title;
    body.innerHTML = content.content;
    
    modal.style.display = 'flex';
}

function closeHelpModal() {
    document.getElementById('help-modal').style.display = 'none';
}

function showContactForm() {
    showHelpModal('contact');
    document.getElementById('modal-title').textContent = 'Contact Support';
    document.getElementById('modal-body').innerHTML = `
        <form id="contact-form">
            <div class="form-group">
                <label>Subject</label>
                <input type="text" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Message</label>
                <textarea class="form-control" rows="4" required></textarea>
            </div>
            <div class="form-group">
                <label>Priority</label>
                <select class="form-control">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Send Message</button>
        </form>
    `;
    
    // Handle contact form submission
    setTimeout(() => {
        document.getElementById('contact-form').addEventListener('submit', function(e) {
            e.preventDefault();
            showAlert('success', 'Message sent successfully! We\'ll get back to you soon.');
            closeHelpModal();
        });
    }, 100);
}

// FAQ toggle functionality
function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Show service details modal
function showServiceDetails(serviceType) {
    const modal = document.getElementById('help-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    const serviceDetails = {
        water: {
            icon: '💧',
            title: 'Water Supply Services',
            description: 'Comprehensive water supply and quality management for your village',
            examples: [
                {
                    title: 'Water Shortage',
                    description: 'No water supply for more than 24 hours, affecting multiple households'
                },
                {
                    title: 'Poor Water Quality',
                    description: 'Dirty, contaminated, or bad-tasting water from municipal supply'
                },
                {
                    title: 'Pipeline Issues',
                    description: 'Broken pipes, leakages, or damaged water infrastructure'
                },
                {
                    title: 'Pressure Problems',
                    description: 'Low water pressure or irregular water flow in taps'
                }
            ],
            services: [
                { icon: '🔧', title: 'Pipeline Repair', description: 'Fix broken or leaking pipes' },
                { icon: '🧪', title: 'Quality Testing', description: 'Water quality analysis and treatment' },
                { icon: '💧', title: 'Supply Restoration', description: 'Restore water supply to affected areas' },
                { icon: '⚡', title: 'Pump Maintenance', description: 'Repair and maintain water pumps' }
            ],
            contacts: [
                { label: 'Water Department', number: '+91 22 2266 1111' },
                { label: 'Emergency Water', number: '+91 22 2266 1112' },
                { label: 'Quality Complaints', number: '+91 22 2266 1113' }
            ]
        },
        electricity: {
            icon: '⚡',
            title: 'Electricity Services',
            description: 'Electrical infrastructure and power supply management',
            examples: [
                {
                    title: 'Power Outages',
                    description: 'Extended power cuts affecting homes and businesses'
                },
                {
                    title: 'Faulty Wiring',
                    description: 'Dangerous electrical connections or exposed wires'
                },
                {
                    title: 'Street Light Issues',
                    description: 'Non-functional street lights causing safety concerns'
                },
                {
                    title: 'Transformer Problems',
                    description: 'Overloaded or damaged electrical transformers'
                }
            ],
            services: [
                { icon: '🔌', title: 'Connection Repair', description: 'Fix electrical connections and wiring' },
                { icon: '💡', title: 'Street Lighting', description: 'Install and maintain street lights' },
                { icon: '⚡', title: 'Power Restoration', description: 'Restore electricity supply' },
                { icon: '🔧', title: 'Transformer Service', description: 'Maintain electrical transformers' }
            ],
            contacts: [
                { label: 'Electricity Board', number: '+91 22 2266 2222' },
                { label: 'Power Emergency', number: '+91 22 2266 2223' },
                { label: 'Street Lights', number: '+91 22 2266 2224' }
            ]
        },
        roads: {
            icon: '🛣️',
            title: 'Roads & Infrastructure',
            description: 'Road maintenance and infrastructure development services',
            examples: [
                {
                    title: 'Potholes',
                    description: 'Large potholes causing vehicle damage and traffic issues'
                },
                {
                    title: 'Broken Roads',
                    description: 'Severely damaged road surfaces needing reconstruction'
                },
                {
                    title: 'Drainage Issues',
                    description: 'Blocked drains causing waterlogging during rains'
                },
                {
                    title: 'Traffic Safety',
                    description: 'Missing road signs, signals, or safety barriers'
                }
            ],
            services: [
                { icon: '🔨', title: 'Road Repair', description: 'Fix potholes and road damage' },
                { icon: '🚧', title: 'Construction', description: 'New road construction projects' },
                { icon: '💧', title: 'Drainage', description: 'Install and maintain drainage systems' },
                { icon: '🚦', title: 'Traffic Management', description: 'Install signals and road signs' }
            ],
            contacts: [
                { label: 'Public Works', number: '+91 22 2266 3333' },
                { label: 'Road Emergency', number: '+91 22 2266 3334' },
                { label: 'Traffic Police', number: '+91 22 2266 3335' }
            ]
        },
        healthcare: {
            icon: '🏥',
            title: 'Healthcare Services',
            description: 'Medical facilities and emergency healthcare services',
            examples: [
                {
                    title: 'Medical Emergencies',
                    description: 'Urgent medical situations requiring immediate attention'
                },
                {
                    title: 'Clinic Issues',
                    description: 'Problems with local health centers or medical facilities'
                },
                {
                    title: 'Ambulance Service',
                    description: 'Need for emergency medical transportation'
                },
                {
                    title: 'Medicine Shortage',
                    description: 'Lack of essential medicines at local health centers'
                }
            ],
            services: [
                { icon: '🚑', title: 'Emergency Care', description: '24/7 emergency medical services' },
                { icon: '💊', title: 'Medicine Supply', description: 'Ensure availability of essential medicines' },
                { icon: '👩‍⚕️', title: 'Doctor Visits', description: 'Regular medical checkups and consultations' },
                { icon: '🏥', title: 'Facility Maintenance', description: 'Maintain and upgrade health facilities' }
            ],
            contacts: [
                { label: 'Emergency', number: '108' },
                { label: 'Health Center', number: '+91 22 2266 4444' },
                { label: 'Ambulance', number: '+91 22 2266 4445' }
            ]
        },
        education: {
            icon: '📚',
            title: 'Education Services',
            description: 'Educational facilities and resources for the community',
            examples: [
                {
                    title: 'School Infrastructure',
                    description: 'Damaged classrooms, missing furniture, or poor facilities'
                },
                {
                    title: 'Teacher Shortage',
                    description: 'Lack of qualified teachers for various subjects'
                },
                {
                    title: 'Transportation',
                    description: 'Issues with school buses or student transportation'
                },
                {
                    title: 'Educational Resources',
                    description: 'Shortage of books, computers, or learning materials'
                }
            ],
            services: [
                { icon: '🏫', title: 'Infrastructure', description: 'Build and maintain school facilities' },
                { icon: '👨‍🏫', title: 'Teacher Training', description: 'Recruit and train qualified teachers' },
                { icon: '🚌', title: 'Transportation', description: 'Provide safe school transportation' },
                { icon: '📖', title: 'Resources', description: 'Supply books and learning materials' }
            ],
            contacts: [
                { label: 'Education Dept', number: '+91 22 2266 5555' },
                { label: 'School Admin', number: '+91 22 2266 5556' },
                { label: 'Transport', number: '+91 22 2266 5557' }
            ]
        },
        sanitation: {
            icon: '🗑️',
            title: 'Sanitation Services',
            description: 'Waste management and cleanliness services for the community',
            examples: [
                {
                    title: 'Garbage Collection',
                    description: 'Irregular or missed garbage collection schedules'
                },
                {
                    title: 'Waste Overflow',
                    description: 'Overflowing garbage bins or dumping sites'
                },
                {
                    title: 'Public Toilets',
                    description: 'Dirty or non-functional public toilet facilities'
                },
                {
                    title: 'Sewage Issues',
                    description: 'Blocked sewers or sewage overflow problems'
                }
            ],
            services: [
                { icon: '🚛', title: 'Waste Collection', description: 'Regular garbage pickup services' },
                { icon: '♻️', title: 'Recycling', description: 'Waste segregation and recycling programs' },
                { icon: '🚽', title: 'Sanitation', description: 'Maintain public toilets and facilities' },
                { icon: '🧹', title: 'Street Cleaning', description: 'Regular street and area cleaning' }
            ],
            contacts: [
                { label: 'Sanitation Dept', number: '+91 22 2266 6666' },
                { label: 'Waste Emergency', number: '+91 22 2266 6667' },
                { label: 'Public Toilets', number: '+91 22 2266 6668' }
            ]
        }
    };
    
    const service = serviceDetails[serviceType];
    if (!service) return;
    
    title.textContent = service.title;
    body.innerHTML = `
        <div class="service-details-content">
            <div class="service-details-header">
                <div class="service-details-icon">${service.icon}</div>
                <div>
                    <h3 class="service-details-title">${service.title}</h3>
                    <p>${service.description}</p>
                </div>
            </div>
            
            <div class="service-section">
                <h4>🔍 Common Issues & Examples</h4>
                <div class="issue-examples">
                    ${service.examples.map(example => `
                        <div class="issue-example">
                            <h5>${example.title}</h5>
                            <p>${example.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="service-section">
                <h4>🛠️ Available Services</h4>
                <div class="service-info-grid">
                    ${service.services.map(item => `
                        <div class="service-info-item">
                            <div class="icon">${item.icon}</div>
                            <h6>${item.title}</h6>
                            <p>${item.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="contact-info">
                <h5>📞 Emergency Contacts</h5>
                <div class="contact-list">
                    ${service.contacts.map(contact => `
                        <div class="contact-item">
                            <strong>${contact.label}:</strong>
                            <span>${contact.number}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--gray-200);">
                <button class="btn btn-primary" onclick="closeHelpModal(); showReportForm('Medium');" style="width: 100%;">
                    Report ${service.title} Issue
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Load statistics from API
async function loadStatistics() {
    try {
        const response = await fetch('/api/statistics');
        const stats = await response.json();
        
        // Update hero stats
        updateStatElement('hero-total', stats.total);
        updateStatElement('hero-resolved', stats.resolved);
        updateStatElement('hero-pending', stats.pending);
        
        // Update detailed stats if they exist
        updateStatElement('total-issues', stats.total);
        updateStatElement('pending-issues', stats.pending);
        updateStatElement('progress-issues', stats.inProgress);
        updateStatElement('resolved-issues', stats.resolved);
        
    } catch (error) {
        console.error('Error loading statistics:', error);
        // Use fallback values for demo
        updateStatElement('hero-total', 1247);
        updateStatElement('hero-resolved', 892);
        updateStatElement('hero-pending', 355);
    }
}

// Animate number counting
function updateStatElement(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const duration = 2000;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Show report form
function showReportForm(priority = 'Medium') {
    const formSection = document.getElementById('report-form');
    const prioritySelect = document.getElementById('priority');
    
    if (formSection) {
        formSection.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Set priority if emergency
        if (prioritySelect && priority === 'High') {
            prioritySelect.value = 'High';
        }
        
        // Focus on first input
        setTimeout(() => {
            const nameInput = document.getElementById('name');
            if (nameInput) nameInput.focus();
        }, 100);
    }
}

// Hide report form
function hideReportForm() {
    const formSection = document.getElementById('report-form');
    
    if (formSection) {
        formSection.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = document.getElementById('issueForm');
        if (form) {
            form.reset();
            clearImagePreview();
            clearAlerts();
        }
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const formData = new FormData(form);
    
    // Show loading state
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/issues', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            showAlert('success', `Issue reported successfully! Your tracking ID is: ${result.issueId}`);
            
            // Reset form after delay
            setTimeout(() => {
                hideReportForm();
                loadStatistics(); // Refresh stats
            }, 3000);
        } else {
            throw new Error('Failed to submit report');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showAlert('error', 'Failed to submit report. Please try again.');
    } finally {
        submitBtn.textContent = 'Submit Report';
        submitBtn.disabled = false;
    }
}

// Handle photo preview
function handlePhotoPreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('image-preview');
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                    <button type="button" onclick="clearImagePreview()" style="position: absolute; top: -8px; right: -8px; background: red; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">×</button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
}

// Clear image preview
function clearImagePreview() {
    const preview = document.getElementById('image-preview');
    const photoInput = document.getElementById('photo');
    
    if (preview) preview.innerHTML = '';
    if (photoInput) photoInput.value = '';
}

// Show alert
function showAlert(type, message) {
    const container = document.getElementById('alert-container');
    if (!container) return;
    
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    container.innerHTML = `
        <div class="alert ${alertClass}">
            ${message}
        </div>
    `;
}

// Clear alerts
function clearAlerts() {
    const container = document.getElementById('alert-container');
    if (container) container.innerHTML = '';
}

// Initialize sidebar menu functionality
function initSidebarMenu() {
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the service type from the link text
            const linkText = this.textContent.trim();
            
            // Filter services based on selection
            if (linkText.includes('All Services')) {
                showAllServices();
            } else if (linkText.includes('Water Supply')) {
                filterServicesByType('water');
            } else if (linkText.includes('Electricity')) {
                filterServicesByType('electricity');
            } else if (linkText.includes('Roads')) {
                filterServicesByType('roads');
            } else if (linkText.includes('Healthcare')) {
                filterServicesByType('healthcare');
            } else if (linkText.includes('Education')) {
                filterServicesByType('education');
            } else if (linkText.includes('Sanitation')) {
                filterServicesByType('sanitation');
            } else if (linkText.includes('My Requests')) {
                showSection('my-requests');
            } else if (linkText.includes('Settings')) {
                showSection('settings');
            } else if (linkText.includes('Help')) {
                showSection('help');
            }
        });
    });
}

// Show all services
function showAllServices() {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.style.display = 'flex';
    });
    
    // Show services section, hide others
    showSection('services');
}

// Filter services by type
function filterServicesByType(type) {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        if (card.classList.contains(type)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show services section, hide others
    showSection('services');
}

// Show specific section and hide others
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section, .services-grid, .stats-section');
    
    sections.forEach(section => {
        if (section.id === sectionId || 
            (sectionId === 'services' && section.classList.contains('services-grid')) ||
            (sectionId === 'services' && section.classList.contains('stats-section'))) {
            section.style.display = section.classList.contains('services-grid') ? 'grid' : 'block';
        } else {
            section.style.display = 'none';
        }
    });
    
    // Show hero section only for services
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.display = sectionId === 'services' ? 'block' : 'none';
    }
}

// FAQ Toggle Function - Updated to handle both FAQ structures
function toggleFAQ(questionElement) {
    const faqItem = questionElement.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    
    // Handle different icon structures
    let icon = questionElement.querySelector('.faq-icon') || questionElement.querySelector('.faq-toggle');
    
    // Close all other FAQ items in the same container
    const faqContainer = faqItem.closest('.faq-container') || faqItem.closest('.faq-section');
    if (faqContainer) {
        faqContainer.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
                const otherAnswer = item.querySelector('.faq-answer');
                const otherIcon = item.querySelector('.faq-icon') || item.querySelector('.faq-toggle');
                
                if (otherAnswer) otherAnswer.classList.remove('active');
                if (otherIcon) otherIcon.textContent = '+';
            }
        });
    }
    
    // Toggle current FAQ item
    if (faqItem.classList.contains('active')) {
        faqItem.classList.remove('active');
        if (answer) answer.classList.remove('active');
        if (icon) icon.textContent = '+';
    } else {
        faqItem.classList.add('active');
        if (answer) answer.classList.add('active');
        if (icon) icon.textContent = '−';
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeServices();
    initSidebarMenu();
    updateStats();
    initializeFAQ();
});

// Initialize FAQ functionality
function initializeFAQ() {
    // Handle main FAQ section - attach to entire FAQ item for better click area
    const mainFaqItems = document.querySelectorAll('.faq-item-main');
    console.log('Found FAQ items:', mainFaqItems.length);
    
    mainFaqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question-main');
        if (question) {
            question.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('FAQ question clicked:', index);
                toggleMainFAQ(item);
            });
            
            // Add cursor pointer style
            question.style.cursor = 'pointer';
        }
    });
    
    // Handle help section FAQ (if any exist)
    const helpFaqQuestions = document.querySelectorAll('.faq-question');
    helpFaqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            toggleFAQ(this);
        });
    });
}

// Main FAQ Toggle Function - FinWise style with chevron arrows
function toggleMainFAQ(faqItem) {
    const isCurrentlyActive = faqItem.classList.contains('active');
    
    console.log('Toggling FAQ item:', faqItem, 'Currently active:', isCurrentlyActive);
    
    // Close all FAQ items first
    document.querySelectorAll('.faq-item-main').forEach(item => {
        item.classList.remove('active');
    });
    
    // If this item wasn't active, open it
    if (!isCurrentlyActive) {
        faqItem.classList.add('active');
        console.log('FAQ item activated');
    }
}
// Select all FAQ question blocks
const faqQuestions = document.querySelectorAll(".faq-question-main");

faqQuestions.forEach((question) => {
  question.addEventListener("click", () => {
    const faqItem = question.parentElement;

    // Close all other FAQs (accordion style)
    document.querySelectorAll(".faq-item-main").forEach((item) => {
      if (item !== faqItem) {
        item.classList.remove("active");
        item.querySelector(".faq-answer-main").style.maxHeight = null;
      }
    });

    // Toggle current FAQ
    faqItem.classList.toggle("active");

    const answer = faqItem.querySelector(".faq-answer-main");
    if (faqItem.classList.contains("active")) {
      answer.style.maxHeight = answer.scrollHeight + "px"; // slide down
    } else {
      answer.style.maxHeight = null; // slide up
    }
  });
});
