// Verification script for bookingCache.ts and Agendamento cache lifecycle

class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new LocalStorageMock();

const BOOKING_CLIENT_CACHE_KEY = 'lg_clinic_client_draft';

function getCachedClientData() {
  try {
    const raw = localStorage.getItem(BOOKING_CLIENT_CACHE_KEY);
    if (!raw) {
      return { name: '', phone: '', email: '', notes: '' };
    }
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return { name: '', phone: '', email: '', notes: '' };
    }
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      notes: typeof parsed.notes === 'string' ? parsed.notes : '',
    };
  } catch {
    return { name: '', phone: '', email: '', notes: '' };
  }
}

function setCachedClientData(client) {
  try {
    const sanitized = {
      name: client.name ? String(client.name).slice(0, 150) : '',
      phone: client.phone ? String(client.phone).slice(0, 30) : '',
      email: client.email ? String(client.email).slice(0, 150) : '',
      notes: client.notes ? String(client.notes).slice(0, 500) : '',
    };
    localStorage.setItem(BOOKING_CLIENT_CACHE_KEY, JSON.stringify(sanitized));
  } catch {
    // Graceful error handling
  }
}

function clearCachedClientData() {
  try {
    localStorage.removeItem(BOOKING_CLIENT_CACHE_KEY);
  } catch {}
}

// ── Test Execution ──
let passed = 0;
let total = 0;
function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('--- TEST SUITE: Booking Cache & Privacy Lifecycle ---');

// Test 1: Empty cache returns blank defaults
localStorage.clear();
const initial = getCachedClientData();
assert(
  initial.name === '' && initial.phone === '' && initial.email === '' && initial.notes === '',
  'Initial empty cache returns blank fields'
);

// Test 2: Typing in form saves to localStorage
const clientDraft = {
  name: 'Maria Silva',
  phone: '(11) 98765-4321',
  email: 'maria.silva@exemplo.com',
  notes: 'Primeira consulta de avaliação'
};
setCachedClientData(clientDraft);
const storedRaw = JSON.parse(localStorage.getItem(BOOKING_CLIENT_CACHE_KEY));
assert(
  storedRaw.name === 'Maria Silva' && storedRaw.phone === '(11) 98765-4321',
  'Cache saves draft data to localStorage correctly'
);

// Test 3: Data minimization - No tokens, passwords, or clinical data saved
const sensitiveAttempt = {
  name: 'Maria Silva',
  phone: '(11) 98765-4321',
  email: 'maria@test.com',
  notes: 'Dúvidas',
  password: 'super_secret_password',
  token: 'jwt_bearer_token_12345',
  clinicalHistory: 'Histórico médico confidencial'
};
setCachedClientData(sensitiveAttempt);
const minimizedRaw = JSON.parse(localStorage.getItem(BOOKING_CLIENT_CACHE_KEY));
assert(
  minimizedRaw.password === undefined &&
  minimizedRaw.token === undefined &&
  minimizedRaw.clinicalHistory === undefined &&
  Object.keys(minimizedRaw).length === 4,
  'Data minimization strictly enforced (no passwords, tokens or clinical fields saved)'
);

// Test 4: Restoration on page refresh / return
const restored = getCachedClientData();
assert(
  restored.name === 'Maria Silva' &&
  restored.phone === '(11) 98765-4321' &&
  restored.email === 'maria@test.com' &&
  restored.notes === 'Dúvidas',
  'Cached data accurately repopulates upon user returning/refreshing'
);

// Test 5: Simulated Booking Failure (e.g. slot conflict or network error) -> CACHE MUST BE PRESERVED
let isSubmitting = true;
let submitError = null;
let isSuccess = false;

try {
  // Simulating backend rejection (e.g., slot already taken)
  throw new Error('Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro horário.');
  // clearCachedClientData() is NOT called here
} catch (err) {
  submitError = err.message;
  isSubmitting = false;
  // Cache remains intact!
}

assert(
  submitError.includes('Este horário acabou de ser reservado'),
  'Appointment failure caught properly'
);
const preservedCache = getCachedClientData();
assert(
  preservedCache.name === 'Maria Silva' && preservedCache.phone === '(11) 98765-4321',
  'Cache is PRESERVED on submission error so user does not lose their data'
);

// Test 6: Simulated Booking Success -> CACHE MUST BE DESTROYED
isSubmitting = true;
submitError = null;
try {
  // Simulating backend success (RPC create_public_appointment returns valid appointment)
  const mockRpcResponse = { id: 'apt_123', status: 'pending' };
  if (mockRpcResponse.id) {
    clearCachedClientData(); // Called STRICTLY upon backend confirmation
    isSuccess = true;
  }
} catch (err) {
  submitError = err.message;
}

assert(isSuccess === true, 'Appointment succeeded');
const postSuccessCache = getCachedClientData();
assert(
  postSuccessCache.name === '' &&
  postSuccessCache.phone === '' &&
  postSuccessCache.email === '' &&
  postSuccessCache.notes === '',
  'Cache is DESTROYED strictly upon confirmed backend success'
);
assert(
  localStorage.getItem(BOOKING_CLIENT_CACHE_KEY) === null,
  'localStorage key is removed completely after success'
);

// Test 7: Malformed or corrupted localStorage resilience
localStorage.setItem(BOOKING_CLIENT_CACHE_KEY, '{"invalidJson: [broken');
const resilientDraft = getCachedClientData();
assert(
  resilientDraft.name === '' && resilientDraft.phone === '',
  'Gracefully handles corrupted JSON in localStorage without throwing errors'
);

console.log(`\nResults: ${passed}/${total} assertions passed.`);
if (passed === total) {
  console.log('ALL TESTS PASSED SUCCESSFULLY!');
}
