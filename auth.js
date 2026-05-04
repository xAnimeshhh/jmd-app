(function() {
    const isLoggedIn = localStorage.getItem('jmd_isLoggedIn');
    const sessionActive = sessionStorage.getItem('jmd_sessionActive');

    if (!isLoggedIn) {
        window.location.href = "login.html";
        return;
    }

    if (isLoggedIn && !sessionActive) {
        document.documentElement.style.display = 'none'; 
        window.addEventListener('DOMContentLoaded', () => {
            document.documentElement.style.display = 'block';
            createAppLockOverlay();
        });
    }
})();

let enteredPin = "";
const masterPin = "1707"; 

function createAppLockOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'app-lock-screen';
    overlay.innerHTML = `
        <div class="lock-container">
            <div class="lock-header">
                <div class="logo-circle">
                    <img src="assets/logo.webp" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                </div>
                <h2 style="color: #ffd700; margin: 10px 0; letter-spacing: 2px;">JMD TRADERS</h2>
                <p style="color: #aaa; font-size: 12px; text-transform: uppercase;">Secure Access</p>
                <div class="pin-display">
                    <span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
            </div>
            <div class="numpad">
                ${[1,2,3,4,5,6,7,8,9].map(n => `<button onclick="pressNum('${n}')">${n}</button>`).join('')}
                <button onclick="window.location.href='login.html'"><i class="fa-solid fa-power-off"></i></button>
                <button onclick="pressNum('0')">0</button>
                <button onclick="clearPin()"><i class="fa-solid fa-backspace"></i></button>
            </div>
            <div class="hint" style="font-size: 12px; color: rgba(255, 204, 51, 0.7); text-align: center; margin-top: 20px; letter-spacing: 1px;">
                Hint: Mummy
            </div>
            <div id="fast-toast"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const style = document.createElement('style');
    style.innerHTML = `
        #app-lock-screen { 
            position:fixed; top:0; left:0; width:100%; height:100%; 
            background: radial-gradient(circle at center, #800040 0%, #1a0008 100%); 
            z-index: 1000000; display:flex; align-items:center; justify-content:center; 
            font-family: sans-serif; color:white; backdrop-filter: blur(10px);
        }
        .lock-container { width:300px; text-align:center; }
        .logo-circle {
            position: relative;
            width: 95px; height: 95px; margin: 0 auto 20px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            background: #25000c; box-shadow: 0 0 25px rgba(255, 204, 51, 0.2);
        }
        .logo-circle::before {
            content: '';
            position: absolute;
            top: -3px; left: -3px; right: -3px; bottom: -3px;
            border-radius: 50%;
            background: conic-gradient(from 0deg, #ffcc33, #b38728, #aa771c, #ffcc33);
            animation: rotate 3s linear infinite;
            z-index: -1;
        }
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .pin-display { display:flex; justify-content:center; gap:15px; margin:30px 0; }
        .dot { width:14px; height:14px; border:2px solid rgba(255,215,0,0.3); border-radius:50%; }
        .dot.filled { background:#ffd700; border-color:#ffd700; box-shadow:0 0 10px #ffd700; }
        .numpad { display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; }
        .numpad button { 
            width:70px; height:70px; border-radius:50%; border:1px solid rgba(255,215,0,0.1); 
            background: rgba(255,255,255,0.05); color:white; font-size:24px; font-weight:bold; 
            cursor:pointer; transition: 0.1s; 
        }
        .numpad button:active { background:#ffd700; color:#4a000e; transform:scale(0.9); }
        #fast-toast { 
            position:fixed; top:30px; left:50%; transform:translateX(-50%); 
            padding:10px 20px; border-radius:10px; font-size:14px; font-weight:bold; 
            display:none; z-index:1000001; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
    `;
    document.head.appendChild(style);
}

window.pressNum = function(num) {
    if (enteredPin.length < 4) {
        enteredPin += num;
        updateDots();
        if (enteredPin.length === 4) {
            // Chota sa delay taaki user ko aakhri dot fill hota dikhe
            setTimeout(checkPin, 100);
        }
    }
};

window.clearPin = function() {
    enteredPin = enteredPin.slice(0, -1);
    updateDots();
};

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, i) => i < enteredPin.length ? dot.classList.add('filled') : dot.classList.remove('filled'));
}

function showAuthToast(msg, color) {
    const t = document.getElementById('fast-toast');
    if (!t) return;
    t.innerText = msg;
    t.style.background = color;
    t.style.color = 'white';
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 1500);
}

function checkPin() {
    if (enteredPin === masterPin) {
        sessionStorage.setItem('jmd_sessionActive', 'true');
        showAuthToast("ACCESS GRANTED ✅", "linear-gradient(to right, #11998e, #38ef7d)");
        setTimeout(() => {
            const overlay = document.getElementById('app-lock-screen');
            overlay.style.opacity = '0';
            overlay.style.transition = '0.3s';
            setTimeout(() => {
                overlay.remove();
                document.documentElement.style.display = 'block'; // Ensure page is visible
            }, 300);
        }, 300);
    } else {
        showAuthToast("WRONG PIN ❌", "linear-gradient(to right, #cb2d3e, #ef473a)");
        enteredPin = "";
        setTimeout(updateDots, 200);
    }
}
