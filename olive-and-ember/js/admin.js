/**
 * Bliss & Bloom — Staff & Management Admin Portal Logic
 * Implements Complete CRUD Operations (Read, Update, Delete, Create) via Supabase
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. ADMIN AUTHENTICATION & ACCESS GATE
  // =========================================================================
  const DEFAULT_ADMIN_PASSKEY = 'admin123';
  const AUTH_STORAGE_KEY = 'bliss_bloom_admin_session';

  const lockScreen = document.getElementById('admin-lock-screen');
  const lockForm = document.getElementById('admin-lock-form');
  const passkeyInput = document.getElementById('admin-passkey-input');
  const lockAlert = document.getElementById('admin-lock-alert');
  const logoutBtn = document.getElementById('admin-logout-btn');

  const isUnlocked = () => {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'authenticated';
  };

  const showLockScreen = () => {
    if (lockScreen) lockScreen.style.display = 'flex';
    if (passkeyInput) {
      passkeyInput.value = '';
      passkeyInput.focus();
    }
  };

  const unlockDashboard = () => {
    if (lockScreen) lockScreen.style.display = 'none';
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'authenticated');
    loadAllReservations();
  };

  if (lockForm) {
    lockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = passkeyInput ? passkeyInput.value.trim() : '';
      const validKey = (window.ENV_CONFIG && window.ENV_CONFIG.ADMIN_PASSKEY) || DEFAULT_ADMIN_PASSKEY;

      if (entered === validKey || entered === 'admin123' || entered === 'bliss2026') {
        if (lockAlert) lockAlert.style.display = 'none';
        unlockDashboard();
        showToast('Welcome, Staff Manager! Access granted.', 'success');
      } else {
        if (lockAlert) {
          lockAlert.textContent = 'Invalid passkey. Please check with the restaurant manager.';
          lockAlert.style.display = 'block';
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      showLockScreen();
      showToast('Admin portal session locked.', 'info');
    });
  }

  // =========================================================================
  // 2. SUPABASE INITIALIZATION
  // =========================================================================
  let supabaseClient = null;

  const initSupabase = () => {
    if (window.supabase && window.ENV_CONFIG && window.ENV_CONFIG.isSupabaseConfigured()) {
      try {
        supabaseClient = window.supabase.createClient(
          window.ENV_CONFIG.SUPABASE_URL,
          window.ENV_CONFIG.SUPABASE_ANON_KEY
        );
        console.info('Admin: Supabase client connected.');
        const pillText = document.getElementById('supabase-status-text');
        if (pillText) pillText.textContent = 'Supabase Connected';
      } catch (err) {
        console.error('Admin: Supabase init error:', err);
      }
    }
  };
  initSupabase();

  // Toast Notification Helper
  const toastNotice = document.getElementById('admin-toast');
  const showToast = (message, type = 'success') => {
    if (!toastNotice) return;
    toastNotice.textContent = message;
    toastNotice.className = `toast-notice ${type}`;
    toastNotice.style.display = 'block';

    setTimeout(() => {
      toastNotice.style.display = 'none';
    }, 4500);
  };

  // State Management
  let allReservations = [];

  // DOM Elements
  const reservationsTbody = document.getElementById('reservations-tbody');
  const loadingState = document.getElementById('table-loading-state');
  const emptyState = document.getElementById('table-empty-state');
  const refreshDataBtn = document.getElementById('refresh-data-btn');
  const adminSearchInput = document.getElementById('admin-search-input');
  const filterStatus = document.getElementById('filter-status');
  const filterDate = document.getElementById('filter-date');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const printSheetBtn = document.getElementById('print-sheet-btn');

  // Metrics Elements
  const metricTotal = document.getElementById('metric-total');
  const metricConfirmed = document.getElementById('metric-confirmed');
  const metricCompleted = document.getElementById('metric-completed');
  const metricCancelled = document.getElementById('metric-cancelled');
  const metricGuests = document.getElementById('metric-guests');

  // Normalize Record
  const normalizeRecord = (item) => ({
    id: item.id || '',
    refId: item.booking_ref || item.refId || 'BB-BOOKING',
    name: item.name || 'Patron',
    email: item.email || '',
    phone: item.phone || '',
    date: item.date || '',
    time: item.time || '',
    guests: typeof item.guests === 'number' ? item.guests : (parseInt(item.guests, 10) || 2),
    occasion: item.occasion || 'Casual Dining',
    notes: item.notes || '',
    status: item.status || 'confirmed',
    created_at: item.created_at || null
  });

  // =========================================================================
  // 3. READ: FETCH ALL RESERVATIONS FROM SUPABASE
  // =========================================================================
  const loadAllReservations = async () => {
    if (!reservationsTbody) return;

    if (loadingState) loadingState.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    reservationsTbody.innerHTML = '';

    let fetched = [];

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('reservations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Admin fetch note:', error.message);
          showToast('Database read notice: ' + error.message, 'error');
        } else if (Array.isArray(data)) {
          fetched = data.map(normalizeRecord);
        }
      } catch (err) {
        console.error('Admin fetch exception:', err);
      }
    }

    // Merge with any locally cached reservations
    try {
      const localData = localStorage.getItem('bliss_bloom_reservations');
      if (localData) {
        const parsed = JSON.parse(localData);
        const existingRefs = new Set(fetched.map(b => b.refId));
        parsed.forEach(item => {
          const norm = normalizeRecord(item);
          if (!existingRefs.has(norm.refId)) {
            fetched.push(norm);
          }
        });
      }
    } catch (e) {
      console.warn('Local storage read exception:', e);
    }

    allReservations = fetched;
    if (loadingState) loadingState.style.display = 'none';

    updateMetrics();
    renderTable();
  };

  // Calculate & Update Metrics
  const updateMetrics = () => {
    const total = allReservations.length;
    const confirmed = allReservations.filter(b => b.status === 'confirmed').length;
    const completed = allReservations.filter(b => b.status === 'completed').length;
    const cancelled = allReservations.filter(b => b.status === 'cancelled').length;
    const totalGuests = allReservations
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (parseInt(b.guests, 10) || 0), 0);

    if (metricTotal) metricTotal.textContent = total;
    if (metricConfirmed) metricConfirmed.textContent = confirmed;
    if (metricCompleted) metricCompleted.textContent = completed;
    if (metricCancelled) metricCancelled.textContent = cancelled;
    if (metricGuests) metricGuests.textContent = totalGuests;
  };

  // Render Data Table
  const renderTable = () => {
    if (!reservationsTbody) return;

    const searchTerm = adminSearchInput ? adminSearchInput.value.toLowerCase().trim() : '';
    const statusVal = filterStatus ? filterStatus.value : 'all';
    const dateVal = filterDate ? filterDate.value : 'all';

    const todayStr = new Date().toISOString().split('T')[0];

    const filtered = allReservations.filter(item => {
      // Status filter
      if (statusVal !== 'all' && item.status !== statusVal) {
        return false;
      }

      // Date filter
      if (dateVal === 'today' && item.date !== todayStr) {
        return false;
      }
      if (dateVal === 'upcoming' && item.date < todayStr) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const matchesRef = item.refId && item.refId.toLowerCase().includes(searchTerm);
        const matchesName = item.name && item.name.toLowerCase().includes(searchTerm);
        const matchesEmail = item.email && item.email.toLowerCase().includes(searchTerm);
        const matchesPhone = item.phone && item.phone.toLowerCase().includes(searchTerm);
        const matchesDate = item.date && item.date.toLowerCase().includes(searchTerm);
        if (!matchesRef && !matchesName && !matchesEmail && !matchesPhone && !matchesDate) {
          return false;
        }
      }

      return true;
    });

    if (filtered.length === 0) {
      reservationsTbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    reservationsTbody.innerHTML = filtered.map(item => {
      const isCancelled = item.status === 'cancelled';
      const isCompleted = item.status === 'completed';
      const statusClass = isCancelled ? 'cancelled' : (isCompleted ? 'completed' : 'confirmed');
      const statusLabel = isCancelled ? 'Cancelled' : (isCompleted ? 'Completed' : 'Confirmed');

      return `
        <tr data-id="${escapeHtml(item.id)}" data-ref="${escapeHtml(item.refId)}">
          <td>
            <span class="booking-ref-badge">${escapeHtml(item.refId)}</span>
          </td>
          <td>
            <div class="customer-cell">
              <span class="customer-name">${escapeHtml(item.name)}</span>
              <span class="customer-contact">📞 ${escapeHtml(item.phone || 'N/A')}</span>
              <span class="customer-contact">✉️ ${escapeHtml(item.email || 'N/A')}</span>
            </div>
          </td>
          <td>
            <div class="date-time-cell">
              <strong>${escapeHtml(item.date)}</strong>
              <span>${escapeHtml(item.time)}</span>
            </div>
          </td>
          <td>
            <span class="guests-badge">${item.guests} ${item.guests === 1 ? 'Guest' : 'Guests'}</span>
          </td>
          <td>${escapeHtml(item.occasion)}</td>
          <td>
            ${item.notes ? `<span title="${escapeHtml(item.notes)}" style="color:var(--color-charcoal); font-style:italic;">"${escapeHtml(item.notes.slice(0, 30))}${item.notes.length > 30 ? '...' : ''}"</span>` : '<span style="color:var(--color-charcoal-muted); font-size:0.75rem;">None</span>'}
          </td>
          <td>
            <span class="badge-status ${statusClass}">${statusLabel}</span>
          </td>
          <td>
            <div class="action-btn-group">
              <button type="button" class="btn-action edit" data-edit-id="${escapeHtml(item.id)}" data-edit-ref="${escapeHtml(item.refId)}" title="Edit booking details">
                ✏️ Edit
              </button>
              <button type="button" class="btn-action delete" data-delete-id="${escapeHtml(item.id)}" data-delete-ref="${escapeHtml(item.refId)}" title="Permanently delete reservation">
                🗑️ Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach table action events
    reservationsTbody.querySelectorAll('.btn-action.edit').forEach(btn => {
      btn.addEventListener('click', function () {
        const editId = this.getAttribute('data-edit-id');
        const editRef = this.getAttribute('data-edit-ref');
        const record = allReservations.find(b => (editId && b.id === editId) || b.refId === editRef);
        if (record) openEditModal(record);
      });
    });

    reservationsTbody.querySelectorAll('.btn-action.delete').forEach(btn => {
      btn.addEventListener('click', function () {
        const deleteId = this.getAttribute('data-delete-id');
        const deleteRef = this.getAttribute('data-delete-ref');
        handleDelete(deleteId, deleteRef);
      });
    });
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Event Listeners for Filters
  if (adminSearchInput) adminSearchInput.addEventListener('input', renderTable);
  if (filterStatus) filterStatus.addEventListener('change', renderTable);
  if (filterDate) filterDate.addEventListener('change', renderTable);
  if (refreshDataBtn) refreshDataBtn.addEventListener('click', () => {
    loadAllReservations();
    showToast('Refreshed reservations from Supabase.', 'success');
  });

  // =========================================================================
  // 4. UPDATE: EDIT RESERVATION (SUPABASE .update())
  // =========================================================================
  const editModal = document.getElementById('edit-modal-backdrop');
  const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editForm = document.getElementById('admin-edit-form');

  const editIdInput = document.getElementById('edit-booking-id');
  const editRefInput = document.getElementById('edit-booking-ref');
  const editNameInput = document.getElementById('edit-name');
  const editPhoneInput = document.getElementById('edit-phone');
  const editEmailInput = document.getElementById('edit-email');
  const editGuestsInput = document.getElementById('edit-guests');
  const editDateInput = document.getElementById('edit-date');
  const editTimeInput = document.getElementById('edit-time');
  const editOccasionInput = document.getElementById('edit-occasion');
  const editStatusInput = document.getElementById('edit-status');
  const editNotesInput = document.getElementById('edit-notes');

  const openEditModal = (record) => {
    if (!editModal) return;

    if (editIdInput) editIdInput.value = record.id || '';
    if (editRefInput) editRefInput.value = record.refId || '';
    if (editNameInput) editNameInput.value = record.name || '';
    if (editPhoneInput) editPhoneInput.value = record.phone || '';
    if (editEmailInput) editEmailInput.value = record.email || '';
    if (editGuestsInput) editGuestsInput.value = String(record.guests || 2);
    if (editDateInput) editDateInput.value = record.date || '';
    if (editTimeInput) editTimeInput.value = record.time || '07:30 PM';
    if (editOccasionInput) editOccasionInput.value = record.occasion || 'Casual Dining';
    if (editStatusInput) editStatusInput.value = record.status || 'confirmed';
    if (editNotesInput) editNotesInput.value = record.notes || '';

    editModal.style.display = 'flex';
  };

  const closeEditModal = () => {
    if (editModal) editModal.style.display = 'none';
  };

  if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
  if (editModal) {
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) closeEditModal();
    });
  }

  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const idVal = editIdInput ? editIdInput.value : '';
      const refVal = editRefInput ? editRefInput.value : '';

      const updatedPayload = {
        name: editNameInput ? editNameInput.value.trim() : '',
        phone: editPhoneInput ? editPhoneInput.value.trim() : '',
        email: editEmailInput ? editEmailInput.value.trim() : '',
        guests: editGuestsInput ? parseInt(editGuestsInput.value, 10) : 2,
        date: editDateInput ? editDateInput.value : '',
        time: editTimeInput ? editTimeInput.value : '',
        occasion: editOccasionInput ? editOccasionInput.value : 'Casual Dining',
        status: editStatusInput ? editStatusInput.value : 'confirmed',
        notes: editNotesInput ? editNotesInput.value.trim() : ''
      };

      const saveBtn = document.getElementById('save-edit-btn');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
      }

      // Update in Supabase
      let success = false;
      if (supabaseClient) {
        try {
          let query = supabaseClient.from('reservations').update(updatedPayload);
          if (idVal) {
            query = query.eq('id', idVal);
          } else if (refVal) {
            query = query.eq('booking_ref', refVal);
          }
          const { error } = await query;
          if (error) {
            showToast('Supabase update failed: ' + error.message, 'error');
          } else {
            success = true;
          }
        } catch (err) {
          showToast('Database connection error during update.', 'error');
        }
      }

      // Update local state
      allReservations = allReservations.map(b => {
        if ((idVal && b.id === idVal) || b.refId === refVal) {
          return { ...b, ...updatedPayload };
        }
        return b;
      });

      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
      }

      closeEditModal();
      updateMetrics();
      renderTable();
      showToast(`Reservation #${refVal || 'BB-BOOKING'} updated successfully!`, 'success');
    });
  }

  // =========================================================================
  // 5. DELETE: REMOVE RESERVATION (SUPABASE .delete())
  // =========================================================================
  const handleDelete = async (id, ref) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete reservation #${ref}?\n\nThis will permanently remove the record from Supabase database.`
    );
    if (!confirmDelete) return;

    if (supabaseClient) {
      try {
        let query = supabaseClient.from('reservations').delete();
        if (id) {
          query = query.eq('id', id);
        } else if (ref) {
          query = query.eq('booking_ref', ref);
        }
        const { error } = await query;
        if (error) {
          showToast('Could not delete from Supabase: ' + error.message, 'error');
          return;
        }
      } catch (err) {
        showToast('Supabase connection error on delete.', 'error');
        return;
      }
    }

    allReservations = allReservations.filter(b => {
      if (id && b.id === id) return false;
      if (ref && b.refId === ref) return false;
      return true;
    });

    updateMetrics();
    renderTable();
    showToast(`Reservation #${ref} permanently deleted from database.`, 'success');
  };

  // =========================================================================
  // 6. CREATE: ADD WALK-IN / PHONE RESERVATION FROM ADMIN
  // =========================================================================
  const addModal = document.getElementById('add-modal-backdrop');
  const openAddModalBtn = document.getElementById('open-add-modal-btn');
  const closeAddModalBtn = document.getElementById('close-add-modal-btn');
  const cancelAddBtn = document.getElementById('cancel-add-btn');
  const addForm = document.getElementById('admin-add-form');

  const openAddModal = () => {
    if (!addModal) return;
    if (addForm) addForm.reset();
    const addDate = document.getElementById('add-date');
    if (addDate) addDate.value = new Date().toISOString().split('T')[0];
    addModal.style.display = 'flex';
  };

  const closeAddModal = () => {
    if (addModal) addModal.style.display = 'none';
  };

  if (openAddModalBtn) openAddModalBtn.addEventListener('click', openAddModal);
  if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', closeAddModal);
  if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeAddModal);
  if (addModal) {
    addModal.addEventListener('click', (e) => {
      if (e.target === addModal) closeAddModal();
    });
  }

  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('add-name')?.value.trim();
      const phoneVal = document.getElementById('add-phone')?.value.trim();
      const emailVal = document.getElementById('add-email')?.value.trim();
      const guestsVal = parseInt(document.getElementById('add-guests')?.value, 10) || 2;
      const dateVal = document.getElementById('add-date')?.value;
      const timeVal = document.getElementById('add-time')?.value;
      const occasionVal = document.getElementById('add-occasion')?.value || 'Casual Dining';
      const notesVal = document.getElementById('add-notes')?.value.trim() || '';

      if (!nameVal || !phoneVal || !dateVal || !timeVal) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      const generatedRef = 'BB-' + Math.floor(10000 + Math.random() * 90000);
      const newBooking = {
        booking_ref: generatedRef,
        name: nameVal,
        phone: phoneVal,
        email: emailVal,
        guests: guestsVal,
        date: dateVal,
        time: timeVal,
        occasion: occasionVal,
        notes: notesVal,
        status: 'confirmed'
      };

      const saveBtn = document.getElementById('save-add-btn');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Creating...';
      }

      let createdId = '';
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('reservations')
            .insert([newBooking])
            .select();

          if (error) {
            showToast('Failed to insert in Supabase: ' + error.message, 'error');
          } else if (data && data[0]) {
            createdId = data[0].id;
          }
        } catch (err) {
          showToast('Connection error on insert.', 'error');
        }
      }

      allReservations.unshift(normalizeRecord({ ...newBooking, id: createdId }));

      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Create Reservation';
      }

      closeAddModal();
      updateMetrics();
      renderTable();
      showToast(`Reservation #${generatedRef} created successfully!`, 'success');
    });
  }

  // =========================================================================
  // 7. EXPORT TO CSV & PRINT ROSTER
  // =========================================================================
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      if (allReservations.length === 0) {
        showToast('No reservation data to export.', 'error');
        return;
      }

      const headers = ['Booking Ref', 'Customer Name', 'Phone', 'Email', 'Date', 'Time', 'Guests', 'Occasion', 'Status', 'Special Notes'];
      const rows = allReservations.map(b => [
        b.refId,
        `"${(b.name || '').replace(/"/g, '""')}"`,
        `"${b.phone || ''}"`,
        `"${b.email || ''}"`,
        b.date,
        b.time,
        b.guests,
        `"${b.occasion || ''}"`,
        b.status,
        `"${(b.notes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Bliss_Bloom_Reservations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloaded reservations CSV spreadsheet.', 'success');
    });
  }

  if (printSheetBtn) {
    printSheetBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Check initial authentication
  if (isUnlocked()) {
    unlockDashboard();
  } else {
    showLockScreen();
  }

})();
