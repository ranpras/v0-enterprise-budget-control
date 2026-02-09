## LOGIN/LOGOUT TESTING GUIDE

### Perbaikan yang Telah Dilakukan:

1. **Role Context (role-context.tsx)**
   - Menambahkan `useCallback` untuk `login`, `logout`, `switchRole` 
   - Memastikan context value dibuat dengan benar setiap kali ada perubahan
   - Menambahkan debug logging dengan `console.log("[v0]")`

2. **App Shell (app-shell.tsx)**
   - Menambahkan debug logging untuk melihat alur authentication
   - Memastikan conditional rendering bekerja saat logout

3. **App Header (app-header.tsx)**
   - Menghapus `e.preventDefault()` dan `e.stopPropagation()` yang bisa menghalangi logout
   - Logout sekarang berjalan clean

4. **Login Page (login-page.tsx)**
   - Menambahkan delay pada quick login untuk simulasi network
   - Menambahkan debug logging untuk setiap login attempt
   - Form direset setelah login berhasil

### Cara Testing:

#### Test 1: Basic Login
1. Refresh halaman - Anda akan melihat LoginPage
2. Di "Quick Login (Demo)", klik salah satu user (misalnya "Rina Hartono")
3. Tunggu loading selesai
4. Anda akan masuk ke Dashboard
5. Periksa browser console untuk debug logs: `[v0] Quick login success: true`

#### Test 2: Logout
1. Setelah login, klik Avatar di top-right header
2. Klik "Logout"
3. Anda akan kembali ke LoginPage
4. Periksa console logs:
   - `[v0] Logging out user`
   - `[v0] AuthenticatedShell: isAuthenticated = false`
   - `[v0] AuthenticatedShell: Rendering LoginPage`

#### Test 3: Login dengan Form Manual
1. Di login page, ketik email: `budi@company.com`
2. Ketik password: `demo` (atau password apa saja)
3. Klik "Sign In"
4. Tunggu 800ms simulation
5. Seharusnya login berhasil
6. Periksa console: `[v0] Login attempt: { email: 'budi@company.com', success: true }`

#### Test 4: Session Persistence
1. Login dengan user apa saja
2. Refresh halaman (F5 atau Cmd+R)
3. Anda tetap login - session di-restore dari sessionStorage
4. Periksa console: akan ada logs tentang hydration

#### Test 5: Quick Logout dan Re-login
1. Login
2. Logout
3. Klik user yang berbeda di Quick Login
4. Seharusnya login dengan user baru
5. Logout lagi
6. Login dengan user pertama
7. Semua harus berjalan smooth tanpa error

### Debugging Tips:

Jika ada masalah, periksa:
1. Browser Console (F12) untuk melihat `[v0]` debug logs
2. Cek Application > Session Storage untuk melihat `ebcs_auth_user`
3. Pastikan tidak ada error di console

### Demo Users:

- **Rina Hartono** (rina@company.com) - Operator
- **Budi Setiawan** (budi@company.com) - Supervisor  
- **Sari Dewi** (sari@company.com) - Admin Budget
- **Andi Prasetyo** (andi@company.com) - Management

Semua bisa login dengan password: `demo` (atau password apa saja)
