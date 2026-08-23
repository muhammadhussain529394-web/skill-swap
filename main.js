// Default Mock Data
let defaultPosts = [
  {
    id: 1,
    name: "Ali Ahmed",
    type: "NEED",
    need: "JavaScript / Async Await",
    offer: "HTML & CSS Layouts",
    contact: "ali@example.com"
  },
  {
    id: 2,
    name: "Sara Khan",
    type: "OFFER",
    need: "Bootstrap 5 Responsive Grid",
    offer: "Graphic Design / UI UX",
    contact: "sara@example.com"
  },
  {
    id: 3,
    name: "Hamza Shaikh",
    type: "NEED",
    need: "Python Data Analysis",
    offer: "JavaScript Core Logic",
    contact: "03009876543"
  },
  {
    id: 4,
    name: "Usman Raza",
    type: "OFFER",
    need: "UI/UX Design in Figma",
    offer: "HTML & CSS Responsive Web Design",
    contact: "usman@example.com"
  }
];

let posts = JSON.parse(localStorage.getItem('skill_swap_posts')) || defaultPosts;
let exchanges = JSON.parse(localStorage.getItem('skill_swap_exchanges')) || [];
let reports = JSON.parse(localStorage.getItem('skill_swap_reports')) || [];
let currentUser = localStorage.getItem('skill_swap_user') || null;
let activeTab = 'all'; 
let currentSelectedPartner = null;

if(!localStorage.getItem('skill_swap_posts')) {
  localStorage.setItem('skill_swap_posts', JSON.stringify(posts));
}

// Toast Alert
function showToast(message) {
  const toastContainer = document.createElement('div');
  toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
  toastContainer.style.zIndex = '9999';
  toastContainer.innerHTML = `
    <div class="toast show align-items-center text-white bg-success border-0 shadow-lg" role="alert">
      <div class="d-flex">
        <div class="toast-body fw-bold">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  document.body.appendChild(toastContainer);
  setTimeout(() => toastContainer.remove(), 3500);
}

// Render Feed Posts
function displayPosts(filterText = '') {
  const postsList = document.getElementById('postsList');
  const totalPostsBadge = document.getElementById('totalPostsBadge');
  const statTotalPosts = document.getElementById('statTotalPosts');
  const exchangeCount = document.getElementById('exchangeCount');
  
  if(!postsList) return;
  postsList.innerHTML = '';
  if(exchangeCount) exchangeCount.textContent = exchanges.length;
  if(statTotalPosts) statTotalPosts.textContent = posts.length;

  let currentList = (activeTab === 'all') ? posts : exchanges;

  const filteredPosts = currentList.filter(post => 
    post.need.toLowerCase().includes(filterText.toLowerCase()) ||
    post.offer.toLowerCase().includes(filterText.toLowerCase()) ||
    post.name.toLowerCase().includes(filterText.toLowerCase())
  );

  if(totalPostsBadge) totalPostsBadge.textContent = `${filteredPosts.length} Items`;

  if (filteredPosts.length === 0) {
    postsList.innerHTML = `
      <div class="alert alert-info text-center py-4 shadow-sm">
        <h5>No Matching Requests Found!</h5>
        <p class="mb-0">Publish a new request or try selecting another skill filter above.</p>
      </div>
    `;
    return;
  }

  filteredPosts.forEach((post, index) => {
    const isExchange = activeTab === 'my-requests';
    const isNeed = post.type === 'NEED';
    const typeBadge = isNeed 
      ? `<span class="badge bg-warning text-dark">⚠️ Request Type: NEED HELP</span>` 
      : `<span class="badge bg-success">✅ Request Type: OFFERING SKILL</span>`;

    const cardHTML = `
      <div class="card p-3 mb-3 shadow-sm border-0 post-card">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h5 class="fw-bold mb-1 text-dark">${post.name}</h5>
            ${typeBadge}
          </div>
          <div class="d-flex gap-1">
            <button onclick="openReportModal('${post.id}')" class="btn btn-sm btn-outline-warning border-0">🚩 Report</button>
            ${!isExchange ? `<button onclick="deletePost(${index})" class="btn btn-sm btn-outline-danger border-0">✕ Delete</button>` : `<span class="badge bg-success">Exchange Active</span>`}
          </div>
        </div>
        
        <div class="my-2">
          <p class="mb-1"><strong>Skill Offered / Needed:</strong> ${post.need}</p>
          <p class="mb-0 text-muted"><strong>In Exchange For:</strong> ${post.offer}</p>
        </div>
        
        <div class="pt-2 border-top text-secondary small d-flex justify-content-between align-items-center">
          <span><strong>Contact:</strong> ${post.contact}</span>
          ${!isExchange ? `
            <button onclick="openConnectModal('${post.name}', '${post.contact}')" class="btn btn-sm btn-primary py-1 px-3 fw-bold">
              Connect
            </button>` : `<small class="text-success fw-bold">✓ Connected</small>`}
        </div>
      </div>
    `;
    postsList.innerHTML += cardHTML;
  });
}

// Switch Tabs
function switchTab(tab) {
  activeTab = tab;
  document.getElementById('all-posts-tab').classList.toggle('active', tab === 'all');
  document.getElementById('my-requests-tab').classList.toggle('active', tab === 'my-requests');
  document.getElementById('feedTitle').textContent = (tab === 'all') ? "Available Requests" : "My Skill Swap Exchanges";
  displayPosts();
}

// Category Filters
function filterByCategory(category, btnElement) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if(btnElement) btnElement.classList.add('active');
  
  const search = document.getElementById('searchInput');
  if(search) search.value = category;
  displayPosts(category);
}

// Scroll Handlers
function scrollToForm() {
  const el = document.getElementById('formSection');
  if(el) el.scrollIntoView({ behavior: 'smooth' });
  const input = document.getElementById('userName');
  if(input) input.focus();
}

function focusSearch() {
  const search = document.getElementById('searchInput');
  if(search) {
    search.scrollIntoView({ behavior: 'smooth' });
    search.focus();
  }
}

function scrollToFeed() {
  const el = document.getElementById('feedSection');
  if(el) el.scrollIntoView({ behavior: 'smooth' });
}

// Connect Modal Handler
function openConnectModal(name, contact) {
  currentSelectedPartner = { name, contact };
  document.getElementById('modalPartnerName').textContent = name;
  document.getElementById('modalContactInfo').textContent = contact;
  
  const mailBtn = document.getElementById('modalMailLink');
  const waBtn = document.getElementById('modalWhatsappLink');

  if(contact.includes('@')) {
    mailBtn.href = `mailto:${contact}`;
    mailBtn.style.display = 'inline-block';
  } else {
    mailBtn.style.display = 'none';
  }

  const cleanNum = contact.replace(/[^0-9]/g, '');
  if(cleanNum.length >= 10) {
    waBtn.href = `https://wa.me/${cleanNum}`;
    waBtn.style.display = 'inline-block';
  } else {
    waBtn.href = `https://wa.me/?text=Hi%20${encodeURIComponent(name)},%20I%20saw%20your%20SkillSwap%20request!`;
  }

  const modal = new bootstrap.Modal(document.getElementById('connectModal'));
  modal.show();
}

// Confirm Exchange Request
function confirmExchange() {
  if(!currentSelectedPartner) return;
  
  const matched = posts.find(p => p.name === currentSelectedPartner.name);
  if(matched && !exchanges.some(e => e.name === matched.name)) {
    exchanges.push(matched);
    localStorage.setItem('skill_swap_exchanges', JSON.stringify(exchanges));
    showToast(`🤝 Exchange Initiated with ${currentSelectedPartner.name}!`);
  } else {
    showToast("⚠️ Exchange request already active!");
  }

  const modalEl = document.getElementById('connectModal');
  const modalObj = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modalObj.hide();
  displayPosts();
}

// Report Modal Trigger
function openReportModal(postId) {
  document.getElementById('reportPostId').value = postId;
  const modal = new bootstrap.Modal(document.getElementById('reportModal'));
  modal.show();
}
// Robust Report Submission
document.addEventListener('submit', async function (e) {
  if (e.target && e.target.id === 'reportForm') {
    e.preventDefault();

    const postId = document.getElementById('reportPostId').value || 'general';
    const reason = document.getElementById('reportReason').value;
    const details = document.getElementById('reportDetails').value;

    try {
      if (window.db) {
        await window.db.collection("reports").add({
          postId: postId,
          reason: reason,
          details: details,
          createdAt: new Date().toISOString()
        });
        showToast("🚩 Report submitted successfully to Firebase!");
      } else {
        reports.push({ postId, reason, details, date: new Date().toISOString() });
        localStorage.setItem('skill_swap_reports', JSON.stringify(reports));
        showToast("🚩 Report saved successfully!");
      }

      const modalEl = document.getElementById('reportModal');
      const modalObj = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      if (modalObj) modalObj.hide();

      e.target.reset();
    } catch (err) {
      console.error("Report Error:", err);
      showToast("⚠️ Submission Error: " + err.message);
    }
  }
});

      
// Publish Skill Form Submission
const skillForm = document.getElementById('skillForm');
if(skillForm) {
  skillForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const requestType = document.querySelector('input[name="requestType"]:checked')?.value || 'OFFER';
    const name = document.getElementById('userName').value.trim();
    const need = document.getElementById('needSkill').value.trim();
    const offer = document.getElementById('offerSkill').value.trim();
    const contact = document.getElementById('contactInfo').value.trim();

    const newPost = { id: Date.now(), type: requestType, name, need, offer, contact };

    posts.unshift(newPost);
    localStorage.setItem('skill_swap_posts', JSON.stringify(posts));

    displayPosts();
    this.reset();
    showToast("🚀 Your Skill Request has been published!");
  });
}

// Delete Post
function deletePost(index) {
  if (confirm("Are you sure you want to remove this skill request?")) {
    posts.splice(index, 1);
    localStorage.setItem('skill_swap_posts', JSON.stringify(posts));
    displayPosts();
    showToast("🗑️ Skill request removed.");
  }
}

// Auth Login Handler
const authForm = document.getElementById('authForm');
if(authForm) {
  authForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    currentUser = email;
    localStorage.setItem('skill_swap_user', currentUser);
    
    updateAuthUI();
    const modalEl = document.getElementById('loginModal');
    const modalObj = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalObj.hide();
    showToast(`✅ Logged in successfully as ${currentUser}!`);
  });
}

// Profile Modal Dynamic Data Updates
function updateProfileUI() {
  const profileEmail = document.getElementById('profileEmail');
  const profileStatus = document.getElementById('profileStatus');
  const userPostCount = document.getElementById('userPostCount');
  const userExchangeCount = document.getElementById('userExchangeCount');

  if(currentUser) {
    if(profileEmail) profileEmail.textContent = currentUser;
    if(profileStatus) {
      profileStatus.textContent = "Active Logged In Member";
      profileStatus.className = "badge bg-success mb-3";
    }
  } else {
    if(profileEmail) profileEmail.textContent = "Guest User";
    if(profileStatus) {
      profileStatus.textContent = "Not Logged In";
      profileStatus.className = "badge bg-secondary mb-3";
    }
  }

  if(userPostCount) userPostCount.textContent = posts.length;
  if(userExchangeCount) userExchangeCount.textContent = exchanges.length;
}

function updateAuthUI() {
  const btn = document.getElementById('navAuthBtn');
  if(btn && currentUser) {
    btn.textContent = "Logged In";
    btn.className = "btn btn-success btn-sm px-3 fw-bold";
  }
}

// Export Functions to Window Scope
window.deletePost = deletePost;
window.openConnectModal = openConnectModal;
window.openReportModal = openReportModal;
window.confirmExchange = confirmExchange;
window.switchTab = switchTab;
window.filterByCategory = filterByCategory;
window.scrollToForm = scrollToForm;
window.focusSearch = focusSearch;
window.scrollToFeed = scrollToFeed;
window.updateProfileUI = updateProfileUI;

// On Page Load Init
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  if(searchInput) {
    searchInput.addEventListener('input', function(e) {
      displayPosts(e.target.value);
    });
  }
  updateAuthUI();
  displayPosts();
});